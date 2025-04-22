import {AsyncControllerType, asyncHandler} from "../middlewares/asyncHandler.middleware";
import {Request, Response} from "express";
import {RouteHandler, TCPRequest, TCPResponse} from "../services/tcpRouteMapper.service";
import {HTTP_STATUS} from "../config/http.config";

export type TCPHandler = RouteHandler;

export interface ControllerMethod {
  DEFAULT: AsyncControllerType;
  TCP: TCPHandler;
}

export type GenericRequest = Request | TCPRequest;
export type GenericResponse = Response | TCPResponse;

export abstract class BaseController {
  /**
   * Creates a controller method bound to this instance with both HTTP and TCP support
   * @param method - The controller method to bind
   * @returns A ControllerMethod object with bound methods
   */
  protected createControllerMethod(
    method: (req: GenericRequest, res: GenericResponse) => Promise<any>
  ): ControllerMethod {
    const boundMethod = method.bind(this);

    return {
      DEFAULT: asyncHandler(async (req: Request, res: Response): Promise<any> => {
        return await boundMethod(req, res);
      }),
      TCP: async (req: TCPRequest, res: TCPResponse): Promise<any> => {
        return await boundMethod(req, res);
      }
    };
  }

  /**
   * Sends a successful response with data
   * @param res - The response object
   * @param message - Success message
   * @param data - Data to send in the response
   * @param statusCode - HTTP status code (default: 200 OK)
   */
  protected sendSuccess(
    res: GenericResponse,
    message: string,
    data?: any,
    statusCode: number = HTTP_STATUS.OK
  ): any {
    return res.status(statusCode).json({
      message,
      ...data,
    });
  }

  /**
   * Handles pagination for list responses
   * @param results - The results object containing data and pagination info
   * @returns Object with formatted data and pagination details
   */
  protected formatPaginationResponse(results: {
    data: any[];
    totalCount: number;
    totalPage: number;
    page: number;
    skip: number;
    limit: number;
    [key: string]: any;
  }) {
    const {data, totalCount, totalPage, page, skip, limit, ...rest} = results;

    return {
      [this.getCollectionName()]: data,
      pagination: {
        page,
        totalCount,
        totalPage,
        skip,
        limit,
      },
      ...rest
    };
  }

  /**
   * Gets the name of the collection for this controller (to be overridden by subclasses)
   * Default implementation returns "items"
   */
  protected getCollectionName(): string {
    return "items";
  }

  /**
   * Gets the name of a single item for this controller (to be overridden by subclasses)
   * Default implementation returns "item"
   */
  protected getItemName(): string {
    return "item";
  }
}

/**
 * Generic CRUD Controller that extends BaseController with common CRUD operations
 * T represents the service type
 */
export abstract class CRUDController<T> extends BaseController {
  protected readonly service: T;
  public readonly getAll: ControllerMethod;
  public readonly getById: ControllerMethod;
  public readonly create: ControllerMethod;
  public readonly update: ControllerMethod;
  public readonly delete: ControllerMethod;

  protected constructor(service: T) {
    super();
    this.service = service;

    // Initialize standard CRUD methods
    this.getAll = this.createControllerMethod(this.getAllItems);
    this.getById = this.createControllerMethod(this.getItemById);
    this.create = this.createControllerMethod(this.createItem);
    this.update = this.createControllerMethod(this.updateItem);
    this.delete = this.createControllerMethod(this.deleteItem);
  }

  /**
   * These methods should be implemented by the concrete controller classes
   */
  protected abstract getAllItems(req: GenericRequest, res: GenericResponse): Promise<any>;

  protected abstract getItemById(req: GenericRequest, res: GenericResponse): Promise<any>;

  protected abstract createItem(req: GenericRequest, res: GenericResponse): Promise<any>;

  protected abstract updateItem(req: GenericRequest, res: GenericResponse): Promise<any>;

  protected abstract deleteItem(req: GenericRequest, res: GenericResponse): Promise<any>;
}