// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
    production: false,
    views: {
        home: 'home',
        aggregation: 'aggregation',
        details: 'details',
        eventChain: 'eventChain'
    },
    params: {
        system: 'eiffel-repository-id',
        view: 'view',
        target: 'target',
        undefined: 'undefined'
    },
    colors: {
        pass: '#22b14c',
        fail: '#af0020',
        undefined: '#666',
    },
    messages: {
        selectSystem: 'Select a repository',
    },
    historyMaxUnits: 6,
};
