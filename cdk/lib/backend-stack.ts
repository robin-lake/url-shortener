import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';
import { HttpApi, HttpMethod, CorsHttpMethod } from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';

interface BackendStackProps extends cdk.StackProps {
  domainName: string;
  siteSubDomain: string;
}

export class BackendStack extends cdk.Stack {
  public readonly apiUrl: string;

  constructor(scope: Construct, id: string, props: BackendStackProps) {
    super(scope, id, props);

    const { domainName, siteSubDomain } = props;
    const frontendOrigin = `https://${siteSubDomain}.${domainName}`;

    const backendFn = new NodejsFunction(this, 'UrlShortenerFn', {
      entry: path.join(__dirname, '../../backend/src/lambda.ts'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_20_X,
      bundling: {
        forceDockerBundling: false,
      },
      environment: {
        CORS_ORIGIN: frontendOrigin,
      },
    });

    const integration = new HttpLambdaIntegration('LambdaIntegration', backendFn);

    const api = new HttpApi(this, 'UrlShortenerApi', {
      corsPreflight: {
        allowOrigins: [frontendOrigin],
        // allowMethods: [HttpMethod.GET, HttpMethod.POST],
        allowMethods: [CorsHttpMethod.GET, CorsHttpMethod.POST],
        allowHeaders: ['Content-Type'],
      },
    });

    api.addRoutes({ path: '/shorten', methods: [HttpMethod.POST], integration });
    api.addRoutes({ path: '/{shortCode}', methods: [HttpMethod.GET], integration });

    backendFn.addEnvironment('BASE_URL', api.apiEndpoint);

    this.apiUrl = api.apiEndpoint;

    new cdk.CfnOutput(this, 'ApiUrl', { value: api.apiEndpoint });
  }
}
