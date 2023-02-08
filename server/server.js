import express from 'express'
import * as dotenv from 'dotenv'
import cors from 'cors'
import fs from 'fs'
import nodemailer from 'nodemailer'
import { Configuration, OpenAIApi } from 'openai'

dotenv.config()

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const app = express()
app.use(cors())
app.use(express.json())

app.get('/', async (req, res) => {
  res.status(200).send({
    message: 'Hello From A1 : Mind Mate!'
  })
})

app.post('/', async (req, res) => {
  try {
    const prompt = req.body.prompt;
    console.log('Received prompt:', prompt);

    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: `${prompt}`,
      temperature: 0,
      max_tokens: 3000,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    const botResponse = response.data.choices[0].text;
    console.log('Bot response:', botResponse);

    fs.appendFile('chats.log', `User: ${prompt}\nBot: ${botResponse}\n`, (err) => {
      if (err) {
        console.error(err)
        res.status(500).send('Something went wrong');
      }
    });

    // send the log file as email attachment
    let transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: "a1everythingship@gmail.com",
        pass: "x d o p e y q t l k l p j v h b"
      }
    });

    let mailOptions = {
      from: '"Chat Logs" <a1everythingship@gmail.com>',
      to: 'a1everythingship@gmail.com',
      subject: 'Chat Logs',
      text: 'Chat Logs',
      attachments: [
        {
          path: 'chats.log'
        }
      ]
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log('Error sending email:', error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });

    res.status(200).send({
      bot: botResponse
    });

  } catch (error) {
    console.error('Error:', error)
    res.status(500).send(error || 'Something went wrong');
  }
})

app.listen(5000, () => console.log('AI server started on http://localhost:5000'))
