import Knex from 'knex';

export async function up(knex: Knex){
    return knex.schema.createTable('classes', table => {
        table.increments('id').primary();
        table.string('subject').notNullable();
        table.decimal('cost').notNullable();
        
        //RELACIONAMENTO ENTRE TABELA USERS COM CLASSES
        table.integer('user_id')
        .notNullable()
        .references('id')
        .inTable('users')
        .onUpdate('CASCADE')  //se alterar dados do usuario altera tambem todos os campos
        .onDelete('CASCADE')  //se deletar o usuario deleta todo seu historico
    })
}

export async function down(knex: Knex){
    return knex.schema.dropTable('classes');
}