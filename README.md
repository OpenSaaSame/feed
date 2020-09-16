# Openwork Feed

Copyright 2020 Digital Asset (Switzerland) GmbH and/or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0

## Prerequisites

* [DAML SDK](https://docs.daml.com/getting-started/installation.html)
* [Yarn](https://yarnpkg.com/lang/en/docs/install/)

## Overview

This application allows users to create a feed and control users who wish to subscribe them. All user subscriptions
must be approved. Once a user is approved, users can comment, like, re-post etc. on all their favourite posts.

## Quick Start

Build the DAML project:

    daml build

Start the sandbox ledger:

    daml start --start-navigator='no'

Generate the Typescript code:

    daml codegen js -o daml2js .daml/dist/*.dar

Install the Javascript dependencies:

    cd react && yarn install

Start up the development server:

    cd react && yarn start

This opens a browser page pointing to `http://localhost:3000/`.

## Contributing

We welcome suggestions for improvements via issues, or direct contributions via pull requests.
