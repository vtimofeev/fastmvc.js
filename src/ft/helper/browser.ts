declare var bowser:any;

namespace ft.helper {

    export var browser:IBowser = function() {
        return bowser;
    }();


    /*
     ## Flags set for detected Browsers[Engines]
     * `chrome`[`webkit`]
     * `firefox`[`gecko`]
     * `msie`
     * `msedge`
     * Android native browser as `android`[`webkit`]
     * iOS native browser as `ios`[`webkit`]
     * `opera`[`webkit` if >12]
     * `phantomjs`[`webkit`]
     * `safari`[`webkit`]
     * `seamonkey`[`gecko`]
     * BlackBerry native browser as `blackberry`[`webkit`]
     * WebOS native browser as `webos`[`webkit`]
     * Amazon Kindle browser as `silk`[`webkit`]
     * Bada browser as `bada`[`webkit`]
     * Tizen browser as `tizen`[`webkit`]
     * Sailfish browser as `sailfish`[`gecko`]

     For all detected browsers the browser version is set in the `version` field.

     ## Flags set for detected mobile Operating Systems

     * `android`
     * Windows Phone as `windowsphone`
     * `ios` (`iphone`/`ipad`/`ipod`)
     * `blackberry`
     * `firefoxos`
     * `webos` (`touchpad`)
     * `bada`
     * `tizen`
     * `sailfish
     */

    export interface IBowser {
        name:string;

        silk?:boolean;
        webkit?:boolean;
        gecko?:boolean;

        opera?:boolean;
        msie?:boolean;
        msedge?:boolean;
        phantomjs?:boolean;

        version:string;

        mobile?:boolean;
        tablet?:boolean;

        ios?:boolean;
        android?:boolean;
        blackberry?:boolean;
        webos?:boolean;
        bada?:boolean;
        tizen?:boolean;
        sailfish?:boolean;

        osversion?:string;

        a?:boolean; // A class browser(support all features);
        c?:boolean; // C class (degraded);
        x?:boolean; // Unknown browser;
    }

}
