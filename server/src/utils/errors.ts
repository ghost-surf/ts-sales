export class AppError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Não autenticado") {
    super(401, message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Sem permissão para esta ação") {
    super(403, message);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Recurso não encontrado") {
    super(404, message);
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Pedido inválido") {
    super(400, message);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflito de dados") {
    super(409, message);
  }
}
