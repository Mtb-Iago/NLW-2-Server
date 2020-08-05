import Knex from 'knex';

export async function up(knex: Knex){
    return knex.schema.createTable('class_schedule', table => {
        table.increments('id').primary();
        
        table.integer('week_day').notNullable();
        table.integer('from').notNullable();
        table.integer('to').notNullable();
        
        //RELACIONAMENTO ENTRE TABELA USERS COM CLASSES
        table.integer('class_id')
        .notNullable()
        .references('id')
        .inTable('classes')
        .onUpdate('CASCADE')  //se alterar dados do usuario altera tambem todos os campos
        .onDelete('CASCADE')  //se deletar o usuario deleta todo seu historico
    
    })
}

export async function down(knex: Knex){
    return knex.schema.dropTable('class_schedule');
}