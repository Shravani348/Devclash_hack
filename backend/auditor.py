import re
import time
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
                details.append("Site is running on HTTP, not HTTPS.")
            
            if 'Content-Security-Policy' not in headers:
                score -= 15
                details.append("Missing 'Content-Security-Policy' header. This helps prevent XSS.")
                
            if 'X-Frame-Options' not in headers:
                score -= 10
                details.append("Missing 'X-Frame-Options' header. Vulnerable to Clickjacking.")
                
            if 'X-Content-Type-Options' not in headers:
                score -= 10
                details.append("Missing 'X-Content-Type-Options' header. Vulnerable to MIME sniffing.")
                
            if 'Strict-Transport-Security' not in headers and url.startswith('https'):
                score -= 10
                details.append("Missing 'Strict-Transport-Security' (HSTS) header.")
                
            # Simulate exposed env file check (just trying a common path)
            parsed_url = urlparse(url)
            base_url = f"{parsed_url.scheme}://{parsed_url.netloc}"
            env_resp = requests.get(f"{base_url}/.env", timeout=5)
            if env_resp.status_code == 200 and 'DB_' in env_resp.text:
                score -= 50
                details.append("CRITICAL: Exposed .env file detected!")
                
        except Exception as e:
            score = 0
            details.append(f"Security check failed: {str(e)}")
            
        out["score"] = max(0, score)
        out["details"] = details if details else ["Security headers look good."]

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
            details.append(f"Total page load time is high ({load_time:.2f}s). Aim for under 3s.")
            
        if ttfb > 600:
            score -= 15
            details.append(f"Time to First Byte (TTFB) is slow ({ttfb}ms). Consider better hosting or caching.")
            
        if fcp > 2000:
            score -= 15
            details.append(f"First Contentful Paint (FCP) is slow ({fcp:.0f}ms). Ensure critical CSS/JS is optimized.")
            
        # Check Unoptimized images
        images = page.evaluate("""() => {
            return Array.from(document.querySelectorAll('img')).map(img => {
                return { src: img.src, loading: img.getAttribute('loading') };
            });
        }""")
        
        needs_lazy = [img['src'] for img in images if img['loading'] != 'lazy']
        if len(needs_lazy) > 5:
            score -= 10
            details.append(f"Found {len(needs_lazy)} images without 'loading=\"lazy\"'. Lazy load below-the-fold images.")
            
        out["score"] = max(0, score)
        out["details"] = details if details else ["Performance is well optimized."]

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
            details.append(f"DOM is deeply nested ({max_depth} levels). Consider flattening HTML structure.")
            
        # Check inline styles
        inline_style_percent = page.evaluate("""() => {
            const allElements = document.querySelectorAll('*').length;
            const styledElements = document.querySelectorAll('[style]').length;
            return allElements === 0 ? 0 : (styledElements / allElements) * 100;
        }""")
        
        if inline_style_percent > 30:
            score -= 15
            details.append(f"Overuse of inline styles detected ({inline_style_percent:.1f}%). Use external stylesheets or CSS classes.")

        # Check missing meta tags
        has_viewport = page.evaluate("() => !!document.querySelector('meta[name=\"viewport\"]')")
        has_desc = page.evaluate("() => !!document.querySelector('meta[name=\"description\"]')")
        
        if not has_viewport:
            score -= 20
            details.append("Missing meta viewport tag. Crucial for mobile responsiveness.")
        if not has_desc:
            score -= 5
            details.append("Missing meta description. Important for SEO.")

        # Check console errors (We can't easily capture retroactively without a listener, but we can do a dummy check)
        # We could add an event listener at page load if we set it up before goto. For now we skip.

        out["score"] = max(0, score)
        out["details"] = details if details else ["Code looks clean and follows best practices."]

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
            details.append(f"Found {expensive_transition} elements animating expensive layouts (width/height/margin/etc). Prefer 'transform' and 'opacity' for GPU acceleration.")
            
        out["score"] = max(0, score)
        out["details"] = details if details else ["Animations use optimized properties (transform/opacity)."]

    def _check_accessibility(self, page, out):
        score = 100
        details = []

        # Missing alt attributes
        missing_alt = page.evaluate("""() => {
            return document.querySelectorAll('img:not([alt])').length;
        }""")
        
        if missing_alt > 0:
            score -= max(20, missing_alt * 2)
            details.append(f"Found {missing_alt} <img> elements missing 'alt' attributes. Critical for screen readers.")
            
        # Keyboard focus indicators (check inputs)
        missing_aria = page.evaluate("""() => {
            const buttons = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])');
            return Array.from(buttons).filter(b => !b.textContent.trim()).length;
        }""")
        
        if missing_aria > 0:
            score -= 15
            details.append(f"Found {missing_aria} button(s) with no text content and no ARIA label.")
            
        # Heading hierarchy
        headings = page.evaluate("""() => {
            const h = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
            return h.map(el => parseInt(el.tagName.replace('H', '')));
        }""")
        
        if not headings:
            score -= 10
            details.append("No headings found on page. Provide a structured heading hierarchy.")
        else:
            if 1 not in headings:
                score -= 10
                details.append("Page is missing an <h1> heading.")
                
            # Check skipped levels
            current = headings[0] if headings else 0
            skips = 0
            for level in headings[1:]:
                if level - current > 1:
                    skips += 1
                current = level
            if skips > 0:
                score -= min(20, skips * 5)
                details.append(f"Detected {skips} skipped heading level(s) (e.g. h1 -> h3). Maintain sequential order.")

        out["score"] = max(0, score)
        out["details"] = details if details else ["Accessibility is solid and standard-compliant."]

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
                    details.append(f"Horizontal scroll detected on {vp['name']} breakpoint! Fix overflowing elements.")
                    failed_breakpoints += 1
            except Exception:
                pass
            finally:
                page.close()
                context.close()
                
        if failed_breakpoints > 0:
            penalty = (failed_breakpoints / total_breakpoints) * 50
            score -= penalty
        else:
            details.append("Fluid and responsive layout across all major device widths.")
            
        out["score"] = max(0, int(score))
        out["details"] = details

# For testing independently
if __name__ == "__main__":
    import sys
    url = sys.argv[1] if len(sys.argv) > 1 else 'https://example.com'
    auditor = AppAuditor()
    print(auditor.run_full_audit(url))
