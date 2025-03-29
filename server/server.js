const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI("AIzaSyAayV8lZQzdfn6idYu9beZkhgtXm0959dU");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });


const app = express();

const PORT = 3000;
app.use(cors());
app.use(express.json());
app.post("/generate_article",async (req,res)=>{
    const prompt  = req.body.prompt;
    
    console.log(prompt);
    try {
        const result = await model.generateContent(prompt);
        const article = result.response.text();
        res.status(200).json({article});
        
    } catch (error) {
        res.status(500).json({message: `There was an error: ${error}`})
    }
   
});

app.listen(PORT, ()=>{
    console.log('Server is listening on port: 3000')
});