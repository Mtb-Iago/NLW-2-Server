import express from 'express';
import routes from './routes';
import cors from 'cors';

const app = express();

app.use(cors());

app.use(express.json()); // colocar o express pra entender json

app.use(routes)


//localhost:3333/users
app.listen(3333);