import * as fs from 'fs';
import * as path from 'path';
import { typescript } from 'projen';

export interface ProjenComponentBlueprintOptions extends typescript.TypeScriptProjectOptions {
  /**
   * Override package version. I hope you know what you're doing.
   */
  readonly overridePackageVersion?: string;

  /**
   * Overrides the projen version. I hope you know what you're doing.
   */
  readonly projenVersion?: string;
}

/**
 * Blueprint Component app in TypeScript
 *
 *
 * @pjid blueprint
 */
export class ProjenBlueprintComponent extends typescript.TypeScriptProject {
  constructor(options: ProjenComponentBlueprintOptions) {
    super({
      license: 'Apache-2.0',
      projenrcTs: true,
      sampleCode: false,
      github: false,
      eslint: true,
      jest: false,
      npmignoreEnabled: true,
      tsconfig: {
        compilerOptions: {
          esModuleInterop: true,
          noImplicitAny: false,
        },
      },
      ...options,
    });

    const version = options.overridePackageVersion || JSON.parse(fs.readFileSync(path.resolve('./package.json'), 'utf-8')).version;
    this.package.addVersion(version || '0.0.0');
    this.addDevDeps('ts-node@^10');

    // force node types
    this.addDevDeps('@types/node@^18');

    /**
     * We explicitly set the version of projen to cut down on author errors.
     * This is not strictly nessassary. Authors may override this by putting
     * this.addPackageResolutions('projen@something-else') in their package
     */
    const projenVersion = options.projenVersion || '0.71.112';
    this.package.addDeps(`projen@${projenVersion}`);

    // modify bumping tasks
    this.removeTask('release');
    this.removeTask('bump');

    this.addTask('bump', {
      exec: 'npm version patch -no-git-tag-version --no-workspaces-update',
    });

    this.package.addField('preferGlobal', true);

    // set custom scripts
    this.setScript('projen', 'npx projen --no-post');
    this.setScript('prerelease', 'yarn build && yarn package');
    this.setScript('npm:publish', 'yarn bump && yarn build && yarn package && yarn npm:push');
    this.setScript('npm:push', 'yarn npm publish');
  }

  synth(): void {
    super.synth();
  }
}
