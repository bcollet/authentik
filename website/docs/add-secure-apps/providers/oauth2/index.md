---
title: OAuth2 Provider
---

This provider supports both generic OAuth2 as well as OpenID Connect

Scopes can be configured using scope mappings, a type of [property mapping](../property-mappings/index.md#scope-mappings).

| Endpoint             | URL                                                                  |
| -------------------- | -------------------------------------------------------------------- |
| Authorization        | `/application/o/authorize/`                                          |
| Token                | `/application/o/token/`                                              |
| User Info            | `/application/o/userinfo/`                                           |
| Token Revoke         | `/application/o/revoke/`                                             |
| End Session          | `/application/o/<application slug>/end-session/`                     |
| JWKS                 | `/application/o/<application slug>/jwks/`                            |
| OpenID Configuration | `/application/o/<application slug>/.well-known/openid-configuration` |

## GitHub Compatibility

This provider also exposes a GitHub-compatible endpoint. This endpoint can be used by applications, which support authenticating against GitHub Enterprise, but not generic OpenID Connect.

To use any of the GitHub Compatibility scopes, you have to use the GitHub Compatibility Endpoints.

| Endpoint        | URL                         |
| --------------- | --------------------------- |
| Authorization   | `/login/oauth/authorize`    |
| Token           | `/login/oauth/access_token` |
| User Info       | `/user`                     |
| User Teams Info | `/user/teams`               |

To access the user's email address, a scope of `user:email` is required. To access their groups, `read:org` is required. Because these scopes are handled by a different endpoint, they are not customisable as a Scope Mapping.

## Grant types

### `authorization_code`:

This grant is used to convert an authorization code to an access token (and optionally refresh token). The authorization code is retrieved through the Authorization flow, and can only be used once, and expires quickly.

:::info
Starting with authentik 2024.2, applications only receive an access token. To receive a refresh token, both applications and authentik must be configured to request the `offline_access` scope. In authentik this can be done by selecting the `offline_access` Scope mapping in the provider settings.
:::

### `refresh_token`:

Refresh tokens can be used as long-lived tokens to access user data, and further renew the refresh token down the road.

:::info
Starting with authentik 2024.2, this grant requires the `offline_access` scope.
:::

### `client_credentials`:

See [Machine-to-machine authentication](./client_credentials.md)

## Scope authorization

By default, every user that has access to an application can request any of the configured scopes. Starting with authentik 2022.4, you can do additional checks for the scope in an expression policy (bound to the application):

```python
# There are additional fields set in the context, use `ak_logger.debug(request.context)` to see them.
if "my-admin-scope" in request.context["oauth_scopes"]:
    return ak_is_group_member(request.user, name="my-admin-group")
return True
```

## Special scopes

#### GitHub compatibility

- `user`: No-op, is accepted for compatibility but does not give access to any resources
- `read:user`: Same as above
- `user:email`: Allows read-only access to `/user`, including email address
- `read:org`: Allows read-only access to `/user/teams`, listing all the user's groups as teams.

#### authentik

- `goauthentik.io/api`: This scope grants the refresh token access to the authentik API on behalf of the user

## Default scopes <span class="badge badge--version">authentik 2022.7+</span>

When a client does not request any scopes, authentik will treat the request as if all configured scopes were requested. Depending on the configured authorization flow, consent still needs to be given, and all scopes are listed there.

This does _not_ apply to special scopes, as those are not configurable in the provider.

## Signing & Encryption

[JWT](https://jwt.io/introduction)s created by authentik will always be signed.

When a _Signing Key_ is selected in the provider, the JWT will be signed asymmetrically with the private key of the selected certificate, and can be verified using the public key of the certificate. The public key data of the signing key can be retrieved via the JWKS endpoint listed on the provider page.

When no _Signing Key_ is selected, the JWT will be signed symmetrically with the _Client secret_ of the provider, which can be seen in the provider settings.

### Encryption <span class="badge badge--version">authentik 2024.10+</span>

authentik can also encrypt JWTs (turning them into JWEs) it issues by selecting an _Encryption Key_ in the provider. When selected, all JWTs will be encrypted symmetrically using the selected certificate. authentik uses the `RSA-OAEP-256` algorithm with the `A256CBC-HS512` encryption method.
