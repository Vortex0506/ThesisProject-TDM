# DCR Graph App
Source code for a DCR Graphs modelling and simulation tool, for use in the 2021 Software Engineering and Architecture course at KU.

# Dev

Start the project:
Install node js and npm, install yarn `npm install -g yarn`. <br/>
Install dependencies with `yarn` in root.<br/>
Start app with `yarn start` in root.
Additional peers can be started with `yarn startPeer1` & `yarn startPeer2`.

Note that on UNIX the scripts works with `ENV_VAR=X 'do something'`, where as on Windows they will only work with `set ENV_VAR=x && 'do something'`.

Depending on your operating system this will possibly need to be changed in order to run the app in a development environment.

Dependencies should be installed in the workspace (web/electron) that uses them as opposed to in the root.

# Types

Types are now in a separate module, if they are changed / updated, they will need to be rebuilt to avoid your IDE complaining.

To build them you can run the script: `yarn types` in root. Note that they are also built automatically on `yarn start`.