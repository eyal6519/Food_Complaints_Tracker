import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = getCurrentUser();
    const { id } = params;
    const body = await request.json();

    const existing = await db.getComplaintById(id);
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Complaint not found' }, { status: 404 });
    }

    const userName = currentUser?.name || 'Team Member';
    const newResponseDate = body.dateResponseReceived ? body.dateResponseReceived.trim() : null;
    
    // Determine if it was just marked resolved or already resolved
    let resolvedBy = existing.resolvedBy;
    if (newResponseDate && !existing.dateResponseReceived) {
      // Newly resolved
      resolvedBy = userName;
    } else if (!newResponseDate) {
      // Un-resolved
      resolvedBy = undefined;
    }

    const updated = await db.updateComplaint(id, {
      category: body.category?.trim(),
      supplierName: body.supplierName?.trim(),
      warehouseName: body.warehouseName?.trim(),
      dateSentToUs: body.dateSentToUs?.trim(),
      dateSentToSupplier: body.dateSentToSupplier?.trim(),
      description: body.description?.trim(),
      dateResponseReceived: newResponseDate,
      notes: body.notes ? body.notes.trim() : undefined,
      resolvedBy,
      updatedBy: userName
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update complaint: ' + String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const success = await db.deleteComplaint(id);
    if (!success) {
      return NextResponse.json({ success: false, error: 'Complaint not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete complaint: ' + String(error) },
      { status: 500 }
    );
  }
}
