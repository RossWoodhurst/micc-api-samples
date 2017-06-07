function MiccSignalR(miccServerBase, accessToken) {
    var miccSdkBase = `${miccServerBase}/miccsdk`;
    var singlarConnection = $.hubConnection(miccSdkBase, {
        qs: `sessionid=Bearer ${accessToken}`
    });

    // hubs
    var employeeHub;
    var agentHub;

    singlarConnection.logging = true;

    this.onError = function (processError) {
        singlarConnection.error(function (error) {
            console.error('Connection error:  ', error);
            processError(error);
        });
    }

    this.onStateChanged = function (processStateChange) {
        singlarConnection.stateChanged(function (state) {
            console.info('Connection state changed:  ', state);
            processStateChange(state);
        });
    }

    this.start = function (successCallback, failCallback) {
        singlarConnection.start().done(function () {
            console.info(`Connection established with ID=${singlarConnection.id}`);
            successCallback();
        }).fail(function () {
            console.error('Connection failed');
            failCallback();
        });
    }

    this.createAgentHubProxy = function () {
        if (!agentHub) {
            agentHub = singlarConnection.createHubProxy('agentHub');
        }
    }

    this.createEmployeeHubProxy = function () {
        if (!employeeHub) {
            employeeHub = singlarConnection.createHubProxy('employeeHub');
        }
    }

    this.onEmployeeHub = function (methodName, callback) {
        this.createEmployeeHubProxy();
        employeeHub.on(methodName, function onCallback(args) {
            console.info(`Received response for ${methodName}: ${JSON.stringify(args)}`);
            callback(args);
        });
    }

    this.onAgentHub = function (methodName, callback) {
        this.createAgentHubProxy();
        agentHub.on(methodName, function onCallback(args) {
            console.info(`Received response for ${methodName}: ${JSON.stringify(args)}`);
            callback(args);
        });
    }

    this.agentStateChanged = function (callback) {
        this.onAgentHub('onAgentStateChanged', callback);
    }

    this.employeeStateChanged = function (callback) {
        this.onEmployeeHub('employeeStateChanged', callback);
    }

    this.employeeConversationChanged = function (callback) {
        this.onEmployeeHub('employeeConversationChanged', callback);
    }

    this.employeeConversationRemoved = function (callback) {
        this.onEmployeeHub('employeeConversationRemoved', callback);
    }

    this.addSelfMonitor = function () {
        this.createEmployeeHubProxy();
        employeeHub.invoke('addSelfMonitor');
    }
}