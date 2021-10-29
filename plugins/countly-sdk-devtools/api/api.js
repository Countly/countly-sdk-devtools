var plugins = require('../../pluginManager.js');
var common = require("../../../api/utils/common.js");
var common = require("../../../api/utils/common.js");

//write api call
plugins.register("/i/checksum", function(ob) {
    var params = ob.params;
    common.readBatcher.getOne("apps", {'key': params.qstring.app_key + ""}, (err, app) => {
        if (!app) {
            common.returnMessage(params, 400, 'App does not exist');
            return;
        }
        params.app = app;

        const payloads = [];
        payloads.push(params.href.substr(params.fullPath.length + 1));
        
        if (params.req.method.toLowerCase() === 'post') {
            payloads.push(params.req.body);
        }
        
        var output = {"checksum": {}, "checksum256": {}};
        for (let i = 0; i < payloads.length; i++) {
            payloads[i] = (payloads[i] + "").replace("&checksum=" + params.qstring.checksum, "").replace("checksum=" + params.qstring.checksum, "");
            output.checksum[common.crypto.createHash('sha1').update(payloads[i] + params.app.checksum_salt).digest('hex').toUpperCase()] = payloads[i];
        }

        for (let i = 0; i < payloads.length; i++) {
            payloads[i] = (payloads[i] + "").replace("&checksum256=" + params.qstring.checksum256, "").replace("checksum256=" + params.qstring.checksum256, "");
            output.checksum256[common.crypto.createHash('sha256').update(payloads[i] + params.app.checksum_salt).digest('hex').toUpperCase()] = payloads[i];
        }
        common.returnOutput(params, output, true);
    });
    return true;
});