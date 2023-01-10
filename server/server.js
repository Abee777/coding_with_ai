import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import { Configuration, OpenAIApi } from 'openai';

// to be able to use dotenv variables
dotenv.config();

console.log(process.env.OPENAI_API_KEY);

// its a function which accepts an object
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

// creating the instance
const openai = new OpenAIApi(configuration);

// initialize our express app
const app = express();
// setting up couple of middlewares - this will allow us to make those cross origin requests and allow our server to be called from the front end 
app.use(cors());
// this will allow use to pass JSON from the front end to the backend
app.use(express.json());
// create dummy root route
app.get('/', async (req, res) => {
    res.status(200).send({
        message: 'Hello from AI API',
    })
});

// with get we can't really receive a lot of data from the front end, but the post one allow us to have a body or a payload
app.post('/', async (req, res) => {
    try {
        const prompt = req.body.prompt;
        // most important -> create a response || get a response from the open API
        const response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: `${prompt}`,
            temperature: 0, // initial was 0.7
            max_tokens: 200, // initial was 64
            top_p: 1,
            frequency_penalty: 0.5,
            presence_penalty: 0,
            // stop: ["\"\"\""],
        });

        // when we get the response we are sending it back to frontend
        res.status(200).send({
            bot: response.data.choices[0].text
        })
    } catch (error) {
        console.log(error);
        res.status(500).send({ error })
    }
})

// to make sure our server always listens for new requests
app.listen(5000, () => console.log('Server is running on port http://localhost:5000'));



