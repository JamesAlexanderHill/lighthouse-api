# Lighthouse API #
An express endpoint that returns scores from lighthouse

Currently linked with Google Cloud Platform - Google Run to spin up a container whenever the endpoint is hit

## /score ##
Example URL: `/score?url=https://jamesalexanderhill.com&device=mobile&categories=performance`

Possible query params:
*url*: any valid URL
*device*: mobile || desktop
*categories*: performance,accessibility,best-practices,seo,pwa