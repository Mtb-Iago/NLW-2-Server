//essa classe manda os dados para minhas rotas
import { Response, Request} from 'express';

import db from '../database/connection';
import convertHoursToMinutes from '../utils/convertHoursToMinutes';


//essa interface é para tipar os componentes do map do array do schedule
interface ScheduleItem {
    week_day: number;
    from: string;
    to: string;

}

export default class ClassController {

    async index(request: Request, response: Response){
        const filters = request.query 

        const subject = filters.subject as string
        const week_day = filters.week_day as string
        const time = filters.time as string

        if (!filters.week_day || !filters.subject || !filters.time){
            return response.status(400).json({
                error: 'Missing filters to search classes'
            });
        }

        const timeInMinutes = convertHoursToMinutes(time)
        

        //inner joy que lista todos os parametros do usuario
        const classes = await db('classes')
        .whereExists(function(){
            this.select('class_schedule.*')
            .from('class_schedule')
            .whereRaw('`class_schedule`.`class_id` = `classes`.`id`')
            .whereRaw('`class_schedule`.`week_day` = ??', [Number(week_day)])
            .whereRaw('`class_schedule`.`from` <= ??', [timeInMinutes])
            .whereRaw('`class_schedule`.`to` > ??', [timeInMinutes])
        })
        .where('classes.subject', '=', subject)
        .join('users', 'classes.user_id', '=', 'users.id')
        .select(['classes.*', 'users.*'])


        return response.json(classes);
    
    }

    async create (request: Request, response: Response)  {
        const {
             name,
             avatar,
             whatsapp,
             bio,
             subject,
             cost,
             schedule
        } = request.body;
     
        //trx auxilia para inserir no bd todos os itens juntos
        const trx = await db.transaction();
     
        try {
            
       const insertedUsersIds = await trx('users').insert({
         name,
         avatar,
         whatsapp,
         bio
     });
     
     const user_id = insertedUsersIds[0]; //pega o id 
     
     const insertedClassesIds = await trx('classes').insert({
         subject,
         cost,
         user_id
     });
     
     const class_id = insertedClassesIds[0];
     
     // vou percorrer o array com map e mudar o valor das horas em minutos para salvar no bd
     const classSchedule = schedule.map((scheduleItem: ScheduleItem) => {
         
       return {
               class_id ,   
               //convertendo horas em minutos
              week_day: scheduleItem.week_day,
              from: convertHoursToMinutes(scheduleItem.from),
              to: convertHoursToMinutes(scheduleItem.to)
     
         }
     });
     
     await trx ('class_schedule').insert(classSchedule)
     
     await trx.commit();
     
      return response.status(201).send("DEU CERTO")
     
        } catch (err) {
             //se der erro faz rollback no trx!
             await trx.rollback();
     
            return response.status(400).json({
                error: 'Unexpected error while creating new class!'
            })
        }
       }
}