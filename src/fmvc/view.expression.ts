///<reference path='./d.ts'/>

module fmvc {
    export class Expression {
        private static __instance:Expression = new  Expression();
        public static instance():Expression {
            return Expression.__instance;
        }

        // @todo
        private getStyleValue(name:string) {
        }

        public getClassStringValue(propertyName, propertyValue, templateString):string {
            if (_.isBoolean(propertyValue)) {
                return templateString.replace('{' + propertyName + '}', propertyName);
            } else {
                return templateString.replace('{' + propertyName + '}', propertyValue);
            }
        }

        public getDataStringValue(propertyName, propertyValue, strOrExOrMEx):string {
            if (_.isString(strOrExOrMEx)) {
                return strOrExOrMEx.replace('{' + propertyName + '}', propertyValue);
            }
            else if (_.isObject(strOrExOrMEx)) {
                return this.executeMultiExpression(strOrExOrMEx);
            }
        }

        public executeFilters(value:any, filters:string[]):any {
            if(!filters || !filters.length) return value;

            return _.reduce(filters,
                function(memo:any, filter:string, index:number) {
                    if (filter.indexOf('i18n.') === 0) return this.getFormattedMessage(this.i18n[filter.replace('i18n.', '')],memo);
                    else return this.executePlainFilter(filter, memo);
                }, value, this);
        }

        public executePlainFilter(filter:string, value:string):string {
            switch (filter) {
                case 'hhmmss':
                    return ViewHelper.hhmmss(value);
                case Filter.FIRST:
                    return 'first:' + value;
                    break;
                case Filter.SECOND:
                    return 'second:' + value;
                    break;
            }
            return value;
        }

        public executeMultiExpression(view:View, mex:IMultiExpression):string {
            //console.log('------------------------------ ?* --------------------------' , mex);
            //console.log(mex);
            return _.reduce(mex.vars,
                function (memo:string, value:string) {
                    return memo.replace('{'+value+'}',view.getVarValue(value, mex));
                }, mex.result || '{$0}', this);
        }

        public executeExpression(view:View, ex:IExpression):any {
            //console.log(ex);
            var r:any = null;
            // we create object to send to first filter (like i18n method) that returns a string value
            if(ex.args && ex.filters) {
                r = {};
                _.each(ex.args,(v:string,k:string)=>r[k]=view.getVarValue(v,ex),this);
            }
            // other way we search first positive result of values
            else if(ex.values)
            {
                var i = 0, length = ex.values.length;
                while(!r && i < length) {
                    r = view.getVarValue(ex.values[i], ex);
                    //this.log(['Search positive ' + i + ' value in [', ex.values[i], ']=',  r].join(''));
                    i++;
                }
            }
            else throw Error('Expression must has args and filter or values');
            //console.log([this.name , ' ... ExecuteExpression ' , ex, '  result=', JSON.stringify(r), ', of content: ', ex.content].join(''), ex);
            r = this.executeFilters(r, ex.filters);
            return r;
        }

        /*
         public getDataObjectValue(propertyName, propertyValue, templateObject:any):string {
         var getFilterValue = function (reducedValue:string, filter:string | string[]):string {
         if(_.isArray(filter)) {
         if(filter[0] === 'i18n') {
         var secondName = filter[1];
         if (!this.i18n[secondName]) return 'Error:View.getDataObjectValue has no i18n property';
         var data:any = {};
         _.each(templateObject.args, function (value:string, key:string) {
         if (value) data[key] = this.data[value.replace('data.', '')];
         }, this);
         var result = this.getFormattedMessage(this.i18n[secondName], data);
         return templateObject.source.replace('{replace}', result);
         }
         else {
         return this.executeComplexFilter(filter, reducedValue);
         }
         }
         else {
         return this.executePlainFilter(filter, reducedValue);
         }
         };

         return _.reduce(templateObject.filters, getFilterValue, propertyValue, this);
         }
         */
    }
}
