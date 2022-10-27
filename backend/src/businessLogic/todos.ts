import { TodosAccess } from '../dataLayer/todosAcess'
import { AttachmentUtils } from '../helpers/attachmentUtils'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import * as createError from 'http-errors'

// TODO: Implement businessLogic
const todoAccess = new TodosAccess()
const attachmentUtils = new AttachmentUtils()

const logger = createLogger('todos')

export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  userId: string
): Promise<TodoItem> {
  try {
      logger.info(`creating new TodoItem for ${userId}`)
    const itemId = uuid.v4()
    return await todoAccess.createTodo({
      todoId: itemId,
      userId: userId,
      dueDate: createTodoRequest.dueDate,
      done: false,
      createdAt: new Date().toISOString(),
      ...createTodoRequest
    })
  } catch (error) {
    createError('Unable to create error')
  }
}

export async function getAllTodos(): Promise<TodoItem[]> {
  try {
      logger.info('Fetching for all todos ')
    return await todoAccess.getTodos()
  } catch (error) {
    createError('Unable to fetch todos')
  }
}

export async function deleteTodo(userId: string, todoId: string) {
  try {
      logger.info(`deleting todo for user: ${userId} with todo:${todoId}`)
    await todoAccess.deleteTodo(userId, todoId)
  } catch (error) {
    createError('Unable to delete todo item')
  }
}

export async function getTodosForUser(userId: string) {
  try {
    return await todoAccess.getTodosForUser(userId)
  } catch (error) {
    createError(`Unable to fetch todos for user : ${userId}`)
  }
}

export async function getTodoForUser(userId: string, todoId: string): Promise<any> {
    try {
      return await todoAccess.getTodoForUser(userId,todoId);
    } catch (error) {
      createError(`Unable to fetch todos for user : ${userId}`)
    }
  }


export async function updateTodo(userId: string, updateTodoRequest: UpdateTodoRequest, todoId: string): Promise<any> {
    try {
        if(!(todoAccess.getTodoForUser(userId,todoId))) return false

      await todoAccess.updateTodo(userId,updateTodoRequest,todoId);

      return true;
    } catch (error) {
      createError(`Unable to fetch todos for user : ${userId}`)
    }
}

export async function createAttachmentPresignedUrl(
    todoId : string,
    userId : string
  ): Promise<any>{
    let generatedPreSignedUrl = await attachmentUtils.generatePreSignedUrl(todoId, userId);
    let imageUrl = `https://${process.env.ATTACHMENT_S3_BUCKET}.s3.amazonaws.com/images/${todoId}`;
    await todoAccess.updateImageURl(todoId, userId, imageUrl);

    return generatedPreSignedUrl;
  }

