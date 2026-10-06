"""
AegisVault Backend — Custom Exception Handler
Provides consistent JSON error responses without exposing tracebacks.
"""
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
import logging

logger = logging.getLogger('aegisvault')


def custom_exception_handler(exc, context):
    """Return consistent JSON error responses."""
    response = exception_handler(exc, context)

    if response is not None:
        error_data = {
            'error': True,
            'status_code': response.status_code,
            'detail': response.data.get('detail', str(response.data)) if isinstance(response.data, dict) else response.data,
        }
        response.data = error_data
        return response

    # Unhandled exceptions — log but don't expose details
    logger.exception(f"Unhandled exception in {context.get('view', 'unknown')}: {exc}")

    return Response(
        {
            'error': True,
            'status_code': 500,
            'detail': 'An internal server error occurred. Please try again later.',
        },
        status=status.HTTP_500_INTERNAL_SERVER_ERROR
    )
