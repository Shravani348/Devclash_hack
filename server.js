const express = require('express');

const leetcodeRoutes=require('./backend/routes/leetcodeRoutes');
const app = express();

app.use(express.json());

app.use('/api/leetcode', leetcodeRoutes);

app.get('/',(req,res)=>{
res.send('DevIntel360 Backend Running');
});

app.listen(5000,()=>{
console.log('Server running on port 5000');
});