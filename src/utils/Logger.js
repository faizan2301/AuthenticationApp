
class Logger {
  static instance = null;
  isDevelopment = typeof __DEV__ !== 'undefined' ? __DEV__ : false;

  constructor() {
    if (Logger.instance) {
      return Logger.instance;
    }
    Logger.instance = this;
  }


  _getLogPrefix(level) {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}]`;
  }


  _formatMessage(level, category, message, context = {}) {
    const prefix = this._getLogPrefix(level);
    const contextStr = Object.keys(context).length > 0 
      ? ` | Context: ${JSON.stringify(context)}` 
      : '';
    return `${prefix} [${category}] ${message}${contextStr}`;
  }


  info(category, message, context = {}) {
    if (this.isDevelopment) {
      const formatted = this._formatMessage('info', category, message, context);
      console.log(formatted);
    }
  }


  warn(category, message, context = {}) {
    if (this.isDevelopment) {
      const formatted = this._formatMessage('warn', category, message, context);
      console.warn(formatted);
    }
  }


  error(category, message, error = null, context = {}) {
    const errorContext = {
      ...context,
      ...(error && {
        errorMessage: error.message,
        errorStack: error.stack,
        errorName: error.name,
      }),
    };
    const formatted = this._formatMessage('error', category, message, errorContext);
    console.error(formatted);
    
    if (error) {
      console.error('Error details:', error);
    }
  }


  debug(category, message, context = {}) {
    if (this.isDevelopment) {
      const formatted = this._formatMessage('debug', category, message, context);
      console.log(formatted);
    }
  }


  logRequest(method, url, headers = {}, body = null) {
    this.debug('API_REQUEST', `${method} ${url}`, {
      method,
      url,
      headers: this._sanitizeHeaders(headers),
      body: this._sanitizeBody(body),
    });
  }


  logResponse(method, url, status, duration, data = null) {
    const level = status >= 400 ? 'error' : status >= 300 ? 'warn' : 'info';
    this[level]('API_RESPONSE', `${method} ${url} - ${status} (${duration}ms)`, {
      method,
      url,
      status,
      duration,
      dataSize: data ? JSON.stringify(data).length : 0,
    });
  }


  _sanitizeHeaders(headers) {
    const sanitized = { ...headers };
    if (sanitized.Authorization) {
      sanitized.Authorization = 'Bearer ***';
    }
    return sanitized;
  }


  _sanitizeBody(body) {
    if (!body) return null;
    try {
      const parsed = typeof body === 'string' ? JSON.parse(body) : body;
      const sanitized = { ...parsed };
      if (sanitized.password) {
        sanitized.password = '***';
      }
      return sanitized;
    } catch {
      return body;
    }
  }
}

export default new Logger();
