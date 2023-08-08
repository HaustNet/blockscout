/* eslint-disable no-console */
const config = require('./build/configs/app').default;

run();

async function run() {
  console.log();
  try {
    console.log('📋 Here is the list of the features enabled for the running instance. To adjust their configuration, please refer to the documentation.');
    Object.entries(config.features)
      .forEach(([ , feature ]) => {
        const mark = feature.isEnabled ? '✔️' : ' ';
        console.log(`[${ mark }] ${ feature.title }`);
      });

  } catch (error) {
    console.log('🚨 An error occurred while generating the feature report.');
    process.exit(1);
  }
}
