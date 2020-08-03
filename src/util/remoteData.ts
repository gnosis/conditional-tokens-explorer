type RemoteStatusSuccess<T> = { _type: 'success'; data: T }
type RemoteStatus<T> =
  | { _type: 'notAsked' }
  | RemoteStatusSuccess<T>
  | { _type: 'loading' }
  | { _type: 'failure'; error: Error }

function success<T>(data: T): RemoteStatusSuccess<T> {
  return {
    _type: 'success',
    data,
  }
}

function loading<T>(): RemoteStatus<T> {
  return {
    _type: 'loading',
  }
}

function notAsked<T>(): RemoteStatus<T> {
  return {
    _type: 'notAsked',
  }
}

function failure<T>(error: Error): RemoteStatus<T> {
  return {
    _type: 'failure',
    error,
  }
}

export class Remote<T> {
  protected status: RemoteStatus<T>

  protected constructor(status?: RemoteStatus<T>) {
    this.status = status || notAsked()
  }

  public hasData(): this is RemoteWithData<T> {
    return this.status._type === 'success'
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
    if (this.status._type === 'notAsked') {
      return onNotAsked()
    }
    if (this.status._type === 'success') {
      return onSuccess(this.status.data)
    }
    if (this.status._type === 'loading') {
      return onLoading()
    }
    if (this.status._type === 'failure') {
      return onFailure(this.status.error)
    }

    const exhaustiveCheck: never = this.status
    return exhaustiveCheck
  }

  public get(): T | null {
    return this.status._type === 'success' ? this.status.data : null
  }

  public isLoading(): boolean {
    return this.status._type === 'loading'
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
