import { defineBackend } from "@aws-amplify/backend";
import { Effect, Policy, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { auth } from "./auth/resource";
import { storage } from './storage/resource';

const backend = defineBackend({
  auth,
  storage,
});

const customBucketStack = backend.createStack("custom-bucket-stack");

// Import existing bucket
const sabadell = Bucket.fromBucketAttributes(customBucketStack, "Sabadell", {
  bucketArn: "arn:aws:s3:::clientesabadell",
  region: "eu-west-1"
});
const astara = Bucket.fromBucketAttributes(customBucketStack, "Astara", {
  bucketArn: "arn:aws:s3:::clienteastara",
  region: "eu-west-1"
});

backend.addOutput({
  storage: {
    buckets: [
      {
        aws_region: sabadell.env.region,
        bucket_name: sabadell.bucketName,
        name: sabadell.bucketName,
        // @ts-expect-error: Amplify backend type issue - https://github.com/aws-amplify/amplify-backend/issues/2569
        paths: {
          "Grabaciones/*": {
            groupssabadell: ["get", "list", "write"],
          },
        },
      },
      {
        aws_region: astara.env.region,
        bucket_name: astara.bucketName,
        name: astara.bucketName,
        // @ts-expect-error: Amplify backend type issue - https://github.com/aws-amplify/amplify-backend/issues/2569
        paths: {
          "Grabaciones/*": {
            groupsastara: ["get", "list", "write"],
          },
        },
      }
    ]
  },
});
/*
const purificacion = Bucket.fromBucketAttributes(customBucketStack, "Purificacion", {
  bucketArn: "arn:aws:s3:::cliente-pg-ch",
  region: "eu-central-1"
});

backend.addOutput({
  storage: {
    buckets: [
      {
        aws_region: purificacion.env.region,
        bucket_name: purificacion.bucketName,
        name: purificacion.bucketName,
        // @ts-expect-error: Amplify backend type issue - https://github.com/aws-amplify/amplify-backend/issues/2569
        paths: {
          "Grabaciones/*": {
            groupspurificacion: ["get", "list", "write"],
          },
        },
      }
    ]
  },
});


const astara = Bucket.fromBucketAttributes(customBucketStack, "Astara", {
  bucketArn: "arn:aws:s3:::clienteastara",
  region: "eu-west-1"
});

backend.addOutput({
  storage: {
    buckets: [
      {
        aws_region: astara.env.region,
        bucket_name: astara.bucketName,
        name: astara.bucketName,
        // @ts-expect-error: Amplify backend type issue - https://github.com/aws-amplify/amplify-backend/issues/2569
        paths: {
          "Grabaciones/*": {
            groupsastara: ["get", "list", "write"],
          },
        },
      }
    ]
  },
});

const desigual = Bucket.fromBucketAttributes(customBucketStack, "Desigual", {
  bucketArn: "arn:aws:s3:::clientedesigual",
  region: "eu-west-1"
});

backend.addOutput({
  storage: {
    buckets: [
      {
        aws_region: desigual.env.region,
        bucket_name: desigual.bucketName,
        name: desigual.bucketName,
        // @ts-expect-error: Amplify backend type issue - https://github.com/aws-amplify/amplify-backend/issues/2569
        paths: {
          "Grabaciones/*": {
            groupsdesigual: ["get", "list", "write"],
          },
        },
      }
    ]
  },
});
*/
/*
  Define an inline policy to attach to group role
  This policy defines how authenticated users with 
  group role can access your existing buckets
*/ 
/*
const accessPolicy = new Policy(backend.stack, "customBucketAdminPolicy", {
  statements: [
    new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        "s3:ListBucket",
        "s3:GetObject",
        "s3:PutObject", 
        "s3:DeleteObject"
      ],
      resources: [ "arn:aws:s3:::*", "arn:aws:s3:::*"],
    })
  ],
});
*/
const sabadellaccessPolicy = new Policy(backend.stack, "sabadellBucketAdminPolicy", {
  statements: [
    new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        "s3:GetObject",
        "s3:PutObject", 
        "s3:DeleteObject"
      ],
      resources: [ `${sabadell.bucketArn}/Grabaciones/*`],
    }),
    new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ["s3:ListBucket"],
      resources: [
        `${sabadell.bucketArn}`,
        `${sabadell.bucketArn}/*`
      ],
      conditions: {
        StringLike: {
          "s3:prefix": ["Grabaciones/*", "Grabaciones/"],
        },
      },
    }),
  ],
});

const astaraaccessPolicy = new Policy(backend.stack, "astaraBucketAdminPolicy", {
  statements: [
    new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        "s3:GetObject",
        "s3:PutObject", 
        "s3:DeleteObject"
      ],
      resources: [ `${astara.bucketArn}/Grabaciones/*`],
    }),
    new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ["s3:ListBucket"],
      resources: [
        `${astara.bucketArn}`,
        `${astara.bucketArn}/*`
      ],
      conditions: {
        StringLike: {
          "s3:prefix": ["Grabaciones/*", "Grabaciones/"],
        },
      },
    }),
  ],
});

backend.auth.resources.groups["sabadell"].role.attachInlinePolicy(sabadellaccessPolicy);
backend.auth.resources.groups["astara"].role.attachInlinePolicy(astaraaccessPolicy);








/*
// Add the policies to the groups role
backend.auth.resources.groups["sabadell"].role.attachInlinePolicy(accessPolicy);
backend.auth.resources.groups["purificacion"].role.attachInlinePolicy(accessPolicy);
backend.auth.resources.groups["astara"].role.attachInlinePolicy(accessPolicy);
backend.auth.resources.groups["desigual"].role.attachInlinePolicy(accessPolicy);
*/