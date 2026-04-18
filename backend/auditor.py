import re
import time
import asyncio
from urllib.parse import urlparse
import requests
from playwright.sync_api import sync_playwright, TimeoutError

class AppAuditor:
    def __init__(self):
        pass

    def run_full_audit(self, url):
        # Validate URL scheme
        if not url.startswith('http'):
            url = 'https://' + url

        results = {
            "responsiveness": {"score": 0, "details": []},
            "accessibility": {"score": 0, "details": []},
            "performance": {"score": 0, "details": []},
            "animations": {"score": 0, "details": []},
            "security": {"score": 0, "details": []},
            "codeQuality": {"score": 0, "details": []}
        }

        # 1. Security check (can be done with pure requests)
        self._check_security(url, results["security"])
        
        # FIX: Ensure a fresh event loop exists for Playwright when running inside a Flask thread
        asyncio.set_event_loop(asyncio.new_event_loop())

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            
            # --- Performance context ---
            # We open a fresh page to gather initial load performance
            context = browser.new_context()
            page = context.new_page()
            
            start_time = time.time()
            try:
                # To catch TTFB, FCP, LCP we can use performance timing
                response = page.goto(url, wait_until='networkidle', timeout=30000)
                
                # If page fails to load
                if not response:
                    raise Exception("No response from server")
                if response.status >= 400:
                    raise Exception(f"Server returned HTTP {response.status}")
                
            except Exception as e:
                browser.close()
                return {"error": f"Failed to load URL: {str(e)}"}
            
            # Extract basic performance
            self._check_performance(page, start_time, results["performance"])
            
            # --- Code Quality ---
            self._check_code_quality(page, results["codeQuality"])

            # --- Animations ---
            self._check_animations(page, results["animations"])

            # --- Accessibility ---
            self._check_accessibility(page, results["accessibility"])

            page.close()
            context.close()

            # --- Responsiveness ---
            # Check across different viewports
            self._check_responsiveness(browser, url, results["responsiveness"])

            browser.close()

        # Calculate overall score
        scores = [
            results["responsiveness"]["score"],
            results["accessibility"]["score"],
            results["performance"]["score"],
            results["animations"]["score"],
            results["security"]["score"],
            results["codeQuality"]["score"]
        ]
        results["overallScore"] = sum(scores) // len(scores) if scores else 0
        return results

    def _check_security(self, url, out):
        score = 100
        details = []
        try:
            resp = requests.get(url, timeout=10)
            headers = resp.headers
            
            if not url.startswith('https'):
                score -= 20
                details.append("Your site isn't using HTTPS — change your hosting settings to secure it so users don't get 'Not Secure' warnings.")
            
            if 'Content-Security-Policy' not in headers:
                score -= 15
                details.append("No Content-Security-Policy found — add it to your server to protect your site against malicious scripts.")
                
            if 'X-Frame-Options' not in headers:
                score -= 10
                details.append("You're missing an X-Frame-Options header — add it so hackers can't trick people into clicking hidden links on your site.")
                
            if 'X-Content-Type-Options' not in headers:
                score -= 10
                details.append("Missing X-Content-Type-Options — add this 1 line to your server to stop browsers from misinterpreting your files.")
                
            if 'Strict-Transport-Security' not in headers and url.startswith('https'):
                score -= 10
                details.append("No Strict-Transport-Security header — enable it to force browsers to always use a secure connection.")
                
            # Simulate exposed env file check (just trying a common path)
            parsed_url = urlparse(url)
            base_url = f"{parsed_url.scheme}://{parsed_url.netloc}"
            env_resp = requests.get(f"{base_url}/.env", timeout=5)
            if env_resp.status_code == 200 and 'DB_' in env_resp.text:
                score -= 50
                details.append("Your .env file is exposed on the web! Hide it immediately so attackers can't steal your private database passwords.")
                
        except Exception as e:
            score = 0
            details.append(f"Security check failed: {str(e)}")
            
        out["score"] = max(0, score)
        
        if out["score"] >= 90:
            if not details: details.append("Your security setup is flawless! Double-check your API keys aren't pushed to GitHub just to be extra safe.")
        elif out["score"] >= 70:
            details.insert(0, "Your security is decent, but a few tweaks will lock it down completely.")
        elif out["score"] >= 50:
            details.insert(0, "Your site needs some basic security measures to protect your users.")
        else:
            details.insert(0, "Let's be honest — deploying a site with these security gaps would be a major red flag in an interview. Start with the basics first.")
            
        out["details"] = details

    def _check_performance(self, page, start_time, out):
        score = 100
        details = []

        load_time = time.time() - start_time
        
        # Performance entries
        perf_data = page.evaluate("""() => {
            const timing = window.performance.timing;
            const paint = window.performance.getEntriesByType('paint');
            const resources = window.performance.getEntriesByType('resource');
            
            let fcp = 0;
            const paintFcp = paint.find(p => p.name === 'first-contentful-paint');
            if (paintFcp) fcp = paintFcp.startTime;
            
            let ttfb = timing.responseStart - timing.requestStart;
            
            return {
                ttfb: ttfb,
                fcp: fcp,
                resourceCount: resources.length,
                totalResourceSize: resources.reduce((acc, curr) => acc + (curr.transferSize || 0), 0)
            };
        }""")

        ttfb = perf_data.get('ttfb', 0)
        fcp = perf_data.get('fcp', 0)
        
        if load_time > 3.0:
            score -= 20
            details.append(f"Your page takes {load_time:.1f}s to load — compress your files so visitors on slow mobile data don't leave before it opens.")
            
        if ttfb > 600:
            score -= 15
            details.append(f"Your server is responding slowly ({ttfb}ms) — turn on caching or upgrade your hosting plan.")
            
        if fcp > 2000:
            score -= 15
            details.append(f"The screen stays blank too long ({fcp:.0f}ms) — defer non-critical scripts so users see content faster.")
            
        # Check Unoptimized images
        images = page.evaluate("""() => {
            return Array.from(document.querySelectorAll('img')).map(img => {
                return { src: img.src, loading: img.getAttribute('loading') };
            });
        }""")
        
        needs_lazy = [img['src'] for img in images if img['loading'] != 'lazy']
        if len(needs_lazy) > 5:
            score -= 10
            details.append(f"You have {len(needs_lazy)} images loading right away — add 'loading=\"lazy\"' to them so users don't burn their data.")
            
        out["score"] = max(0, score)
        
        if out["score"] >= 90:
            if not details: details.append("Your site loads lightning fast! Just make sure your large hero images or videos are properly compressed before uploading.")
        elif out["score"] >= 70:
            details.insert(0, "Performance is pretty good overall, but fixing this one bottleneck will make it snappier.")
        elif out["score"] >= 50:
            details.insert(0, "Your app feels a bit sluggish. Let's fix the easiest performance wins first.")
        else:
            details.insert(0, "This load time would definitely frustrate an interviewer or user. Here's exactly what to fix to speed it up.")

        out["details"] = details

    def _check_code_quality(self, page, out):
        score = 100
        details = []

        # Find deep DOM elements
        max_depth = page.evaluate("""() => {
            let maxDepth = 0;
            const checkDepth = (node, depth) => {
                if (depth > maxDepth) maxDepth = depth;
                for (let child of node.children) {
                    checkDepth(child, depth + 1);
                }
            };
            checkDepth(document.body, 1);
            return maxDepth;
        }""")
        
        if max_depth > 12:
            score -= 10
            details.append(f"Your HTML tags are too deeply nested ({max_depth} levels) — simplify your code structure to speed up rendering.")
            
        # Check inline styles
        inline_style_percent = page.evaluate("""() => {
            const allElements = document.querySelectorAll('*').length;
            const styledElements = document.querySelectorAll('[style]').length;
            return allElements === 0 ? 0 : (styledElements / allElements) * 100;
        }""")
        
        if inline_style_percent > 30:
            score -= 15
            details.append(f"Too many inline styles ({inline_style_percent:.0f}%) — move them to a CSS file or use Tailwind classes to keep things maintainable.")

        # Check missing meta tags
        has_viewport = page.evaluate("() => !!document.querySelector('meta[name=\"viewport\"]')")
        has_desc = page.evaluate("() => !!document.querySelector('meta[name=\"description\"]')")
        
        if not has_viewport:
            score -= 20
            details.append("You're missing a viewport meta tag — add it so your site doesn't look completely broken and tiny on phones.")
        if not has_desc:
            score -= 5
            details.append("No meta description found — add one so your site looks professional when shared on Google or social media.")

        # Check console errors (We can't easily capture retroactively without a listener, but we can do a dummy check)
        # We could add an event listener at page load if we set it up before goto. For now we skip.

        out["score"] = max(0, score)
        
        if out["score"] >= 90:
            if not details: details.append("Your code is incredibly clean! Try adding OpenGraph tags if you haven't already to make your share links prettier.")
        elif out["score"] >= 70:
            details.insert(0, "Code quality is solid, but a quick refactor here will make it much cleaner.")
        elif out["score"] >= 50:
            details.insert(0, "The codebase is getting a bit messy — let's tackle these easy fixes first.")
        else:
            details.insert(0, "To be honest, this code structure would raise eyebrows in a code review. Fix these critical architectural issues.")
            
        out["details"] = details

    def _check_animations(self, page, out):
        score = 100
        details = []

        # Check transitions on expensive properties
        expensive_transition = page.evaluate("""() => {
            const elements = document.querySelectorAll('*');
            let expensiveCount = 0;
            for (let el of elements) {
                const style = window.getComputedStyle(el);
                if (style.transitionProperty) {
                    if (style.transitionProperty.includes('width') || 
                        style.transitionProperty.includes('height') || 
                        style.transitionProperty.includes('top') || 
                        style.transitionProperty.includes('left') ||
                        style.transitionProperty.includes('margin') ||
                        style.transitionProperty.includes('padding')) {
                        expensiveCount++;
                    }
                }
            }
            return expensiveCount;
        }""")
        
        if expensive_transition > 5:
            score -= 20
            details.append(f"You're animating layout properties on {expensive_transition} elements — switch to 'transform' or 'opacity' to fix laggy, janky animations.")
            
        out["score"] = max(0, score)
        
        if out["score"] >= 90:
            if not details: details.append("Your animations are super smooth and Hardware Accelerated! Just remember to keep transition times under 300ms so it feels snappy.")
        elif out["score"] >= 70:
            details.insert(0, "Animations work well, but you have one optimization left to make it buttery smooth.")
        elif out["score"] >= 50:
            details.insert(0, "A few elements feel sluggish — here's how to fix that and make them feel premium.")
        else:
            details.insert(0, "Honestly, these animations are hurting your UX because they lag. Fix the CSS properties shown here.")
            
        out["details"] = details

    def _check_accessibility(self, page, out):
        score = 100
        details = []

        # Missing alt attributes
        missing_alt = page.evaluate("""() => {
            return document.querySelectorAll('img:not([alt])').length;
        }""")
        
        if missing_alt > 0:
            score -= max(20, missing_alt * 2)
            details.append(f"There are {missing_alt} images missing alt text — add short descriptions so screen readers can explain them to visually impaired users.")
            
        # Keyboard focus indicators (check inputs)
        missing_aria = page.evaluate("""() => {
            const buttons = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])');
            return Array.from(buttons).filter(b => !b.textContent.trim()).length;
        }""")
        
        if missing_aria > 0:
            score -= 15
            details.append(f"Found {missing_aria} icon buttons without labels — add an 'aria-label' so people using screen readers know what to click.")
            
        # Heading hierarchy
        headings = page.evaluate("""() => {
            const h = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
            return h.map(el => parseInt(el.tagName.replace('H', '')));
        }""")
        
        if not headings:
            score -= 10
            details.append("Your page has absolutely no headings — add an <h1> and <h2>s to break up text so users can skim your content easily.")
        else:
            if 1 not in headings:
                score -= 10
                details.append("You're missing an <h1> tag — add exactly one to the top of the page so search engines instantly understand what the app is about.")
                
            # Check skipped levels
            current = headings[0] if headings else 0
            skips = 0
            for level in headings[1:]:
                if level - current > 1:
                    skips += 1
                current = level
            if skips > 0:
                score -= min(20, skips * 5)
                details.append(f"You skipped heading levels {skips} times (like jumping from h1 to h3) — fix the order to keep the page outline logical.")

        out["score"] = max(0, score)
        
        if out["score"] >= 90:
            if not details: details.append("Your app is incredibly accessible to all users! Keep testing new features with just your keyboard to maintain this.")
        elif out["score"] >= 70:
            details.insert(0, "Solid accessibility foundation, but there's a quick fix that will make it fully inclusive.")
        elif out["score"] >= 50:
            details.insert(0, "Some users will struggle to use your app. Here is the easiest thing to fix right now.")
        else:
            details.insert(0, "A recruiter checking for accessibility would fail this site immediately. But don't worry, start by fixing these issues.")
            
        out["details"] = details

    def _check_responsiveness(self, browser, url, out):
        score = 100
        details = []
        
        viewports = [
            {"name": "Mobile S (320px)", "width": 320, "height": 800},
            {"name": "Mobile M (375px)", "width": 375, "height": 800},
            {"name": "Tablet (768px)", "width": 768, "height": 1024},
            {"name": "Laptop (1024px)", "width": 1024, "height": 768},
            {"name": "Desktop (1440px)", "width": 1440, "height": 900}
        ]

        total_breakpoints = len(viewports)
        failed_breakpoints = 0

        for vp in viewports:
            context = browser.new_context(viewport={"width": vp["width"], "height": vp["height"]})
            page = context.new_page()
            try:
                page.goto(url, wait_until='networkidle', timeout=15000)
                
                # Check for horizontal scrolling
                has_h_scroll = page.evaluate("""() => {
                    return document.documentElement.scrollWidth > window.innerWidth;
                }""")
                
                if has_h_scroll:
                    details.append(f"Your site breaks and scrolls sideways on a {vp['name']} screen — check your CSS for fixed widths pushing things off-screen.")
                    failed_breakpoints += 1
            except Exception:
                pass
            finally:
                page.close()
                context.close()
                
        if failed_breakpoints > 0:
            penalty = (failed_breakpoints / total_breakpoints) * 50
            score -= penalty
            
        out["score"] = max(0, int(score))

        if out["score"] >= 90:
            if not details: details.append("Your layout responds perfectly on all devices! Test it on an actual old phone just to be 100% sure the fonts feel readable.")
        elif out["score"] >= 70:
            details.insert(0, "Your app looks great on most screens, but let's fix the one device where it breaks.")
        elif out["score"] >= 50:
            details.insert(0, "Mobile users are having a tough time. Let's start by fixing the most obvious layout breaks.")
        else:
            details.insert(0, "To be blunt: this would fail an interview because it's completely broken on mobile. Check your media queries immediately.")
            
        out["details"] = details

# For testing independently or via subprocess
if __name__ == "__main__":
    import sys
    import json
    url = sys.argv[1] if len(sys.argv) > 1 else 'https://example.com'
    auditor = AppAuditor()
    print(json.dumps(auditor.run_full_audit(url)))
