import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import { HttpApi, HttpMethod, CorsHttpMethod, DomainName } from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';

interface BackendStackProps extends cdk.StackProps {
  domainName: string;
  siteSubDomain: string;
  apiSubDomain: string;
}

export class BackendStack extends cdk.Stack {
  public readonly apiUrl: string;

  constructor(scope: Construct, id: string, props: BackendStackProps) {
    super(scope, id, props);

    const { domainName, siteSubDomain, apiSubDomain } = props;
    const frontendOrigin = `https://${siteSubDomain}.${domainName}`;
    const apiDomain = `${apiSubDomain}.${domainName}`;

    const zone = route53.HostedZone.fromLookup(this, 'Zone', { domainName });

    const apiCertificate = new acm.Certificate(this, 'ApiCertificate', {
      domainName: apiDomain,
      validation: acm.CertificateValidation.fromDns(zone),
    });

    const apiDomainName = new DomainName(this, 'ApiDomainName', {
      domainName: apiDomain,
      certificate: apiCertificate,
    });

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
        allowMethods: [CorsHttpMethod.GET, CorsHttpMethod.POST],
        allowHeaders: ['Content-Type'],
      },
      defaultDomainMapping: {
        domainName: apiDomainName,
      },
    });

    api.addRoutes({ path: '/shorten', methods: [HttpMethod.POST], integration });
    api.addRoutes({ path: '/{shortCode}', methods: [HttpMethod.GET], integration });

    new route53.ARecord(this, 'ApiAliasRecord', {
      recordName: apiDomain,
      target: route53.RecordTarget.fromAlias(
        new targets.ApiGatewayv2DomainProperties(
          apiDomainName.regionalDomainName,
          apiDomainName.regionalHostedZoneId
        )
      ),
      zone,
    });

    const apiBaseUrl = `https://${apiDomain}`;
    backendFn.addEnvironment('BASE_URL', apiBaseUrl);

    this.apiUrl = apiBaseUrl;

    new cdk.CfnOutput(this, 'ApiUrl', { value: apiBaseUrl });
  }
}
