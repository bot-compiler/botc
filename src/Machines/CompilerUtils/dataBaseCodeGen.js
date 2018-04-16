module.exports = {
    generateJson: function (arr) {
        let json = '{';
        for (let i = 0; i < arr.length; ++i) {
            let defaultKeyVal = arr[i].split('=');
            if(defaultKeyVal.length < 2)
                json = json + '"' + arr[i] + '": "" + data[this.uuid]["store"]["' + arr[i] + '"],';
            else
                json = json + '"' + defaultKeyVal[0] + '": "" + "' + defaultKeyVal[1] + '",';
        }
        json = json.substr(0, json.length > 1 ? json.length - 1 : 1) + '}';
        json = json.replace('}', ', "user": this.uuid}');
        return json;
    },

    getUpdateCode: function (response) {
        let code = 'var rows = await dbUtils.getColumns("' + response['table'] + '", {"user": this.uuid}, []); let reply = "I found these items related to you, which one do you want to change?"; for(let i = 0; i < rows.length; ++i) { let row = rows[i]; let index = row["index"]; delete row["index"]; reply += "\\n" + (index + ". " + JSON.stringify(row)); } replier(this.uuid, reply);';
        return code;
    },

    getStoreCode: function (response) {
        let columns = response['columns'];
        let json = this.generateJson(columns);
        return 'await dbUtils.addValues("' + response['table'] + '",' + json + ' );';
    },

    getTransitionCode: function (response, template) {
        let columns = response['columns'];
        let json = this.generateJson(columns);
        return template.replace('#code', 'await dbUtils.updateValues("' + response['table'] + '", ' + json + ', {"user": this.uuid, "index": index});')
    },

    getRetrieveCode: function (response) {
        let json = this.generateJson(response['filter']);
        let required = ' ';
        response['columns'].map((column) => {
            required += '"' + column + '",'
        });
        required = required.substr(0, required.length > 1 ? required.length - 1 : 1);
        let code = 'let rows = await dbUtils.getColumns("' + response['table'] + '", ' + json + ', ' + '[' + required + ']); let template = "' + response['value'] + '"; let reply = ""; for(let i = 0; i < rows.length; ++i){ let temp = template; let row = rows[i]; let keys = Object.keys(row); for(let j = 0; j < keys.length; ++j){temp = temp.replace("@"+keys[j], row[keys[j]])} reply += temp;}\n replier(this.uuid, reply);';
        return code;
    }
}