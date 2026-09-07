import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const updated = await db.updateComplaint(id, {
      category: body.category?.trim(),
      supplierName: body.supplierName?.trim(),
      warehouseName: body.warehouseName?.trim(),
      dateSentToUs: body.dateSentToUs?.trim(),
      dateSentToSupplier: body.dateSentToSupplier?.trim(),
      description: body.description?.trim(),
      dateResponseReceived: body.dateResponseReceived ? body.dateResponseReceived.trim() : null,
      notes: body.notes ? body.notes.trim() : undefined
    });

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Complaint not found' }, { status: 404 });
    }

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
