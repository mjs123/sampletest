
var SampleAPI = function (service, idList, name, defId, authToken, contentType, contentLength) {
    var prom = Promise.resolve({error:"request not proper",response:{statusCode:400}});
    var isError = false;
    for (let idItem of idList) {
        prom = prom.then(function (val) {
            if (!isError) {
                if (defId != undefined && defId !== "") {
                    return service.SecondAPI(idItem, defId, authToken, contentType).then(function (obj) {
                        if (!obj.response.body)
                            obj.response.body = {}
                        obj.response.body["Id"] = defId
                        if (obj.error || obj.response.statusCode !== 204) {
                            isError = true;
                            return { 'error': obj.error, 'response': obj.response };
                        }
                        obj.response.statusCode = 200;
                        return { 'error': null, 'response': obj.response }
                    }, function (err) {
                        isError = true;
                        return { 'error': err, 'response': {body:'error in second api',statusCode:500} };
                    })
                }
                else {
                    return service.FirstAPI(idItem, name, authToken, contentType, contentLength).then(function (obj) {
                        if (obj.error || obj.response.statusCode !== 200) {
                            isError = true;
                            return { 'error': obj.error, 'response': obj.response };
                        }
                        defId = obj.response.body["Id"];
                        return { 'error': null, 'response': obj.response }
                    }, function (err) {
                        isError = true;
                        return { 'error': err, 'response': {body:'error in first api',statusCode:500}  };
                    })
                }
            }
            return val;
        }, function (err) {
            isError = true;
            return { 'error': err, 'response':{body:'internal error' , statusCode:500}  };
        })
    }
    return prom;
}

module.exports = SampleAPI;