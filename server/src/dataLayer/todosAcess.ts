import * as AWS from 'aws-sdk'
const AWSXRay = require('aws-xray-sdk')
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic
export class TodosAccess {
  constructor(
    private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    private readonly TodosTable = process.env.TODOS_TABLE,
    private readonly TodosIndex = process.env.TODOS_CREATED_AT_INDEX
  ) {}

  async createTodo(todo: TodoItem): Promise<TodoItem> {
    logger.info('Todo item is been created  with id ${todo.todoID}')
    await this.docClient
      .put({
        TableName: this.TodosTable,
        Item: todo
      })
      .promise()
    return todo
  }
  async getTodos(): Promise<TodoItem[]> {
    let todos = []
    let result = await this.docClient
      .scan({
        TableName: this.TodosTable
      })
      .promise()
    todos = result.Items
    return todos
  }

  async deleteTodo(userId: string, todoId: string) {
      logger.info(`deleting todo with id: ${todoId}`);
    await this.docClient.delete({
      TableName: this.TodosTable,
      Key: {
          userId,
          todoId
      }
    }).promise();
  }

  async getTodosForUser(userId: string): Promise<TodoItem[]>{
      logger.info(`fetching all todos for user with id: ${userId}`);
      let result = await this.docClient.query({
        TableName: this.TodosTable,
        IndexName: this.TodosIndex,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
    }).promise();
    return result.Items as TodoItem[];
  }

  async getTodoForUser(userId: string, todoId: string): Promise<TodoItem>{
    logger.info(`fetching todo for user with id: ${userId}`);
    let result = await this.docClient.get({
        TableName: this.TodosTable,
        Key : {
            userId,
            todoId
        }
    }).promise()

  return result.Item as TodoItem;
}

  async updateTodo(userId: string, updateTodoRequest: UpdateTodoRequest, todoId: string): Promise<any>{
      logger.info(`Todo is updated for todo item with id: ${todoId}`);
      await this.docClient.update({
        TableName: this.TodosTable,
        Key: {
            todoId,
            userId
        },
        UpdateExpression: 'set #name = :n, #dueDate = :due, #done = :d',
        ExpressionAttributeValues: {
            ':n': updateTodoRequest.name,
            ':due': updateTodoRequest.dueDate,
            ':d': updateTodoRequest.done
        },
        ExpressionAttributeNames: {
            '#name': 'name',
            '#dueDate': 'dueDate',
            '#done': 'done'
        }
      }).promise()
  }

  async updateImageURl(todoId: string, userId: string, imageUrl: string): Promise<any> {
    logger.info('Update Todo Image Url ');
    await this.docClient.update({
      TableName: this.TodosTable,
      Key: {
          todoId,
          userId
      },
      UpdateExpression: 'set #attachmentUrl = :n',
      ExpressionAttributeValues: {
          ':n': imageUrl,
      },
      ExpressionAttributeNames: {
          '#attachmentUrl': 'attachmentUrl'
      }
    }).promise()
  }
}
