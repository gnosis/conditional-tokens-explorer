export enum RemoteStatusTypes {
  NotAsked = 'notAsked',
  Success = 'success',
  Loading = 'loading',
  Failure = 'failure',
}

export type RemoteStatusNotAsked = { _type: RemoteStatusTypes.NotAsked }
export type RemoteStatusSuccess<T> = { _type: RemoteStatusTypes.Success; data: T }
export type RemoteStatusLoading = { _type: RemoteStatusTypes.Loading }
export type RemoteStatusFailure = { _type: RemoteStatusTypes.Failure; error: Error }

type RemoteStatus<T> =
  | RemoteStatusNotAsked
  | RemoteStatusSuccess<T>
  | RemoteStatusLoading
  | RemoteStatusFailure

function success<T>(data: T): RemoteStatusSuccess<T> {
  return {
    _type: RemoteStatusTypes.Success,
    data,
  }
}

function loading<T>(): RemoteStatus<T> {
  return {
    _type: RemoteStatusTypes.Loading,
  }
}

function notAsked<T>(): RemoteStatusNotAsked {
  return {
    _type: RemoteStatusTypes.NotAsked,
  }
}

function failure(error: Error): RemoteStatusFailure {
  return {
    _type: RemoteStatusTypes.Failure,
    error,
  }
}

export class Remote<T> {
  protected status: RemoteStatus<T>

  protected constructor(status?: RemoteStatus<T>) {
    this.status = status || notAsked()
  }

  public hasData(): this is RemoteWithData<T> {
    return this.status._type === RemoteStatusTypes.Success
  }

  public hasError(): this is RemoteWithFailure<Error> {
    return this.status._type === RemoteStatusTypes.Failure
  }

  public match<U>({
    onFailure,
    onLoading,
    onNotAsked,
    onSuccess,
  }: {
    onSuccess: (data: T) => U
    onLoading: () => U
    onNotAsked: () => U
    onFailure: (e: Error) => U
  }): U {
    if (this.status._type === RemoteStatusTypes.NotAsked) {
      return onNotAsked()
    }
    if (this.status._type === RemoteStatusTypes.Success) {
      return onSuccess(this.status.data)
    }
    if (this.status._type === RemoteStatusTypes.Loading) {
      return onLoading()
    }
    if (this.status._type === RemoteStatusTypes.Failure) {
      return onFailure(this.status.error)
    }

    const exhaustiveCheck: never = this.status
    return exhaustiveCheck
  }

  public get(): T | null {
    return this.status._type === RemoteStatusTypes.Success ? this.status.data : null
  }

  public getFailure(): string {
    return this.status._type === RemoteStatusTypes.Failure ? this.status.error.message : ''
  }

  public isNotAsked(): boolean {
    return this.status._type === RemoteStatusTypes.NotAsked
  }

  public isLoading(): boolean {
    return this.status._type === RemoteStatusTypes.Loading
  }

  public isFailure(): boolean {
    return this.status._type === RemoteStatusTypes.Failure
  }

  public isSuccess(): boolean {
    return this.status._type === RemoteStatusTypes.Success
  }

  public getOr(defaultData: T): T {
    return this.get() || defaultData
  }

  public map<U>(mapFunction: (data: T) => U): Remote<U> {
    return this.match<Remote<U>>({
      onSuccess: (x) => Remote.success(mapFunction(x)),
      onNotAsked: () => Remote.notAsked(),
      onFailure: (e) => Remote.failure(e),
      onLoading: () => Remote.loading(),
    })
  }

  static success<T>(data: T): Remote<T> {
    return new Remote(success(data))
  }

  static notAsked<T>(): Remote<T> {
    return new Remote()
  }

  static loading<T>(): Remote<T> {
    return new Remote(loading())
  }

  static failure<T>(error: Error): Remote<T> {
    return new Remote(failure(error))
  }
}

class RemoteWithData<T> extends Remote<T> {
  protected status: RemoteStatusSuccess<T>

  constructor(data: T) {
    super()
    this.status = success(data)
  }

  public get(): T {
    return this.status.data
  }
}

class RemoteWithFailure<T> extends Remote<T> {
  protected status: RemoteStatusFailure

  constructor(error: Error) {
    super()
    this.status = failure(error)
  }

  public getFailure(): string {
    return this.status.error.message
  }
}
