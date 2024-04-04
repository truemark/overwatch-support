import {Construct} from 'constructs';

export class OverwatchSupportConstruct extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    // TODO Trent add AWS Managed Prometheus
    // TODO Add role assignment for Grafana
  }
}
