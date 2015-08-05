///<reference path='./xml2ts.ts' />
import fmvc = require('./xml2ts');
import _ = require('lodash');
import path = require('path');
import async = require('async');


var argv = require('optimist').
    usage('FMVC xml2ts compiler. Version ' + fmvc.VERSION + '.\nCreates view components ts classes from like html notation.\n\nUsage: $0 -p [string] -o [string]').
    demand(['p']).
    describe('p', 'Path to directory').
    describe('c', 'Out compilied js directory').
    describe('o', 'Out directory').argv;

function resolvePath(value:string) {
    var r:string = path.normalize(process.cwd() + '/' + value);
    console.log('Resolve ' , r);
    return r;
}

var sourceOut:any = _.isArray(argv.p)?
    _.map(argv.p, (v:string,k:number)=>({src: resolvePath(v), out: resolvePath(_.isArray(argv.o)?argv.o[k]:argv.o||v)}) )
    :
    [{src:resolvePath(argv.p), out: resolvePath(argv.o || argv.p)}];

_.each(sourceOut, (v)=>new fmvc.Xml2Ts(v.src,v.out));
