/// <reference path="mocha.d.ts" />
function test_describe() {
    describe('something', function () { });
    describe.only('something', function () { });
    describe.skip('something', function () { });
    describe('something', function () {
        this.timeout(2000);
    });
}
function test_context() {
    context('some context', function () { });
    context.only('some context', function () { });
    context.skip('some context', function () { });
    context('some context', function () {
        this.timeout(2000);
    });
}
function test_it() {
    it('does something', function () { });
    it('does something', function (done) { done(); });
    it.only('does something', function () { });
    it.skip('does something', function () { });
    it('does something', function () {
        this.timeout(2000);
    });
}
function test_before() {
    before(function () { });
    before(function (done) { done(); });
}
function test_setup() {
    setup(function () { });
    setup(function (done) { done(); });
}
function test_after() {
    after(function () { });
    after(function (done) { done(); });
}
function test_teardown() {
    teardown(function () { });
    teardown(function (done) { done(); });
}
function test_beforeEach() {
    beforeEach(function () { });
    beforeEach(function (done) { done(); });
}
function test_suiteSetup() {
    suiteSetup(function () { });
    suiteSetup(function (done) { done(); });
}
function test_afterEach() {
    afterEach(function () { });
    afterEach(function (done) { done(); });
}
function test_suiteTeardown() {
    suiteTeardown(function () { });
    suiteTeardown(function (done) { done(); });
}
function test_reporter_string() {
    mocha.reporter('html');
}
function test_reporter_function() {
    mocha.reporter(function () { });
}
function test_setup_slow_option() {
    mocha.setup({ slow: 25 });
}
function test_setup_timeout_option() {
    mocha.setup({ timeout: 25 });
}
function test_setup_globals_option() {
    mocha.setup({ globals: ['mocha'] });
}
function test_setup_ui_option() {
    mocha.setup({ ui: 'bdd' });
}
function test_setup_reporter_string_option() {
    mocha.setup({ reporter: 'html' });
}
function test_setup_reporter_function_option() {
    mocha.setup({ reporter: function () { } });
}
function test_setup_bail_option() {
    mocha.setup({ bail: false });
}
function test_setup_ignore_leaks_option() {
    mocha.setup({ ignoreLeaks: false });
}
function test_setup_grep_string_option() {
    mocha.setup({ grep: "describe" });
}
function test_setup_grep_regex_option() {
    mocha.setup({ grep: new RegExp('describe') });
}
function test_setup_grep_regex_literal_option() {
    mocha.setup({ grep: /(expect|should)/i });
}
function test_setup_all_options() {
    mocha.setup({
        slow: 25,
        timeout: 25,
        ui: 'bdd',
        globals: ['mocha'],
        reporter: 'html',
        bail: true,
        ignoreLeaks: true,
        grep: 'test'
    });
}
function test_run() {
    mocha.run(function () { });
}
function test_growl() {
    mocha.growl();
}
function test_chaining() {
    mocha
        .setup({ slow: 25 })
        .growl()
        .reporter('html')
        .reporter(function () { });
}
var MochaDef = require('mocha');
function test_require_constructor_empty() {
    var instance = new MochaDef();
}
function test_require_constructor_noOptions() {
    var instance = new MochaDef({});
}
function test_require_constructor_allOptions() {
    var instance = new MochaDef({
        grep: /[a-z]*/,
        ui: 'tdd',
        reporter: 'dot',
        timeout: 500,
        bail: true
    });
}
function test_require_fluentParams() {
    var instance = new MochaDef();
    instance.bail(true)
        .bail()
        .addFile('foo.js')
        .reporter('bdd')
        .ui('dot')
        .grep('[a-z]*')
        .grep(/[a-z]*/)
        .invert()
        .ignoreLeaks(true)
        .checkLeaks()
        .growl()
        .globals('foo')
        .globals(['bar', 'zap'])
        .useColors(true)
        .useInlineDiffs(true)
        .timeout(500)
        .slow(100)
        .enableTimeouts(true)
        .asyncOnly(false)
        .noHighlighting(true)
        .run();
}
function test_run_withOnComplete() {
    var instance = new MochaDef();
    instance.run(function (failures) {
        console.log(failures);
    });
}
//# sourceMappingURL=mocha-tests.js.map