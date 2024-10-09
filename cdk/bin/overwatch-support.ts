#!/usr/bin/env node
import 'source-map-support/register';
import {ExtendedApp} from 'truemark-cdk-lib/aws-cdk';
import {OverwatchSupportStack} from '../lib/overwatch-support-stack';
import {OtelSupportStack} from '../lib/otel-support-stack';

const app = new ExtendedApp({
  standardTags: {
    automationTags: {
      id: 'overwatch-support',
      url: 'https://github.com/truemark/overwatch-support',
    },
  },
});

OverwatchSupportStack.fromContext(app, 'OverwatchSupport');
OtelSupportStack.fromContext(app, 'OtelSupport');
