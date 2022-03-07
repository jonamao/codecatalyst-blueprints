import * as fs from 'fs';
import * as path from 'path';

import { Blueprint } from '@caws-blueprint/blueprints.blueprint';

import { Component } from 'projen';

export const sourceRepositoryRootDirectory = 'src';

export interface SourceRepositoryDefinition {
  title: string;
}

export const BAD_SOURCE_CHARACTERS = ['!', '?', '@', '#', '$', '%', '^', '&', '*', '(', ')', '+', '=', '{', '}', '[', ']', '|', '\\', '/', '>', '<', '~', '\`', '\'', '"', ';', ':'];
export const makeValidFolder = (name: string, options?: {
  maxlength?: number;
  invalidChars?: string[];
}): string => {
  const { maxlength = 100, invalidChars = BAD_SOURCE_CHARACTERS } = (options || {});
  const result = name.replace(new RegExp(`[${invalidChars.join('\\')}]`, 'g'), '')
    .substring(0, maxlength);

  return result;
};

export class SourceRepository extends Component {
  public readonly relativePath: string;
  public readonly path: string;

  constructor(
    protected readonly blueprint: Blueprint,
    protected readonly sourceRepository: SourceRepositoryDefinition,
  ) {
    super(blueprint);
    this.sourceRepository.title = makeValidFolder(sourceRepository.title);
    this.relativePath = path.join(sourceRepositoryRootDirectory, sourceRepository.title);
    this.path = path.join(blueprint.context.rootDir, this.relativePath);
  }

  synthesize(): void {
    const srcDir = path.join(this.blueprint.context.rootDir, sourceRepositoryRootDirectory);
    if (!fs.existsSync(srcDir)) {
      fs.mkdirSync(srcDir);
    }

    const repoDir = path.join(srcDir, this.sourceRepository.title);
    if (!fs.existsSync(repoDir)) {
      fs.mkdirSync(repoDir);
    }

    super.synthesize();
  }
}
