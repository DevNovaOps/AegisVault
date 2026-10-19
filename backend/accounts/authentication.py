"""
AegisVault Authentication Classes
Extends SimpleJWT to support JWT authentication via Authorization header or query parameter.
"""
from rest_framework_simplejwt.authentication import JWTAuthentication


class QueryParamJWTAuthentication(JWTAuthentication):
    """
    Extends SimpleJWT's JWTAuthentication to accept JWT token from query parameter
    (?token=... or ?auth=...), while maintaining standard Bearer header support.
    Ideal for secure browser downloads, iframes, and media previews.
    """
    def authenticate(self, request):
        # 1. Standard Authorization header (e.g. Bearer eyJhbGciOi...)
        header = self.get_header(request)
        if header is not None:
            raw_token = self.get_raw_token(header)
            if raw_token is not None:
                validated_token = self.get_validated_token(raw_token)
                return self.get_user(validated_token), validated_token

        # 2. Query parameter fallback (?token=... or ?auth=...)
        token = request.query_params.get('token') or request.query_params.get('auth')
        if token:
            try:
                validated_token = self.get_validated_token(token.encode('utf-8'))
                return self.get_user(validated_token), validated_token
            except Exception:
                return None

        return None
