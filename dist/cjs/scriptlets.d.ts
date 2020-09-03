declare module 'scriptlets' {

    /**
     * Scriptlet properties
     */
    interface IConfiguration {
        /**
         * Scriptlet name
         */
        name: string;

        /**
         * Arguments for scriptlet function
         */
        args: string[];

        /**
         * {'extension'|'corelibs'} engine Defines the final form of scriptlet string presentation
         */
        engine: string;

        /**
         * Version
         */
        version: string;

        /**
         * flag to enable printing to console debug information
         */
        verbose: boolean;

        /**
         * Source rule text is used for debugging purposes
         */
        ruleText: string;
    }

    /**
     * Returns scriptlet code by param
     *
     * @param source
     * @returns js code string
     */
    function invoke(source: IConfiguration): string | null;

    /**
     * Converts scriptlet rule to AdGuard one
     *
     * @param ruleText
     * @returns array of AdGuard scriptlet rules
     */
    function convertScriptletToAdg(ruleText: string): string[];

    /**
     * Checks if ruleText is valid scriptlet rule
     * @param ruleText
     */
    function isValidScriptletRule(ruleText: string): boolean;

    /**
     * Redirects module
     */
    const redirects: {
        /**
         * Checks if the `rule` is AdGuard redirect rule.
         *
         * @param rule
         */
        isAdgRedirectRule(rule: string): boolean;

        /**
         * Checks if the `rule` is **valid** AdGuard redirect resource rule
         * @param rule
         */
        isValidAdgRedirectRule(rule: string): boolean;

        /**
         * Checks if the Ubo redirect `rule` has AdGuard analog. Needed for Ubo->Adg conversion
         * @param rule
         */
        isUboRedirectCompatibleWithAdg(rule: string): boolean;

        /**
         * Checks if the Abp redirect `rule` has AdGuard analog. Needed for Abp->Adg conversion
         * @param rule
         */
        isAbpRedirectCompatibleWithAdg(rule: string): boolean;

        /**
         * Converts redirect rule to AdGuard one
         * @param rule
         */
        convertRedirectToAdg(rule: string): string;
    }
}
