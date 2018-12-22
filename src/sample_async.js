var SampleAPI = async function (service, idList, name, defId, authToken, contentType, contentLength) {
    if(idList.length === 0){
        return {
            error: "request not proper",
            response: {
                statusCode: 400
            }
        };
    }
    var isError = false;
    for (let idItem of idList) {
        try{
            if (!isError) {
                if (defId != undefined && defId !== "") {
                    try {
                        var obj = await service.SecondAPI(idItem, defId, authToken, contentType);
                        if (!obj.response.body)
                            obj.response.body = {}
                        obj.response.body["Id"] = defId
                        if (obj.error || obj.response.statusCode !== 204) {
                            isError = true;
                            return {
                                'error': obj.error,
                                'response': obj.response
                            };
                        }
                        obj.response.statusCode = 200;
                    } catch (err) {
                        isError = true;
                        return {
                            'error': err,
                            'response': {
                                body: 'internal error',
                                statusCode: 500
                            }
                        };
                    }
                } else {
                    try {
                        var obj = await service.FirstAPI(idItem, name, authToken, contentType, contentLength);
                        if (obj.error || obj.response.statusCode !== 200) {
                            isError = true;
                            return {
                                'error': obj.error,
                                'response': obj.response
                            };
                        }
                        defId = obj.response.body["Id"];
                    } catch (err) {
                        isError = true;
                        return {
                            'error': err,
                            'response': {
                                body: 'internal error',
                                statusCode: 500
                            }
                        };
                    }
    
                }
            }
        }catch(err){
            return { 'error': err, 'response':{body:'internal error' , statusCode:500}  };
        }
        
    }
    return {
        'error': null,
        'response': obj.response
    }
}
module.exports = SampleAPI;