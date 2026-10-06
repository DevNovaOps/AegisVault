"""
AegisVault — Support Views
Help and support ticket submission endpoints.
"""
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import SupportTicket
from audit.services import AuditService


class SupportTicketCreateView(APIView):
    """POST /api/v1/owner/support/tickets"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data = request.data

        ticket = SupportTicket.objects.create(
            user=request.user,
            subject=data.get('subject', 'Untitled Request'),
            description=data.get('description', ''),
            category=data.get('category', 'other'),
            priority=data.get('priority', 'medium'),
            status='open',
        )

        AuditService.log(
            user=request.user,
            action_key='support_ticket_created',
            action_title='Support Ticket Created',
            details=f'Submitted support ticket: {ticket.subject}',
            category='system',
        )

        return Response({
            'detail': 'Your support ticket has been submitted. Our team will review it shortly.',
            'ticket_id': str(ticket.id),
        }, status=status.HTTP_201_CREATED)
