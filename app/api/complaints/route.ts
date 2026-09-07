import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const complaints = await db.getComplaints();
    return NextResponse.json({ success: true, data: complaints });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch complaints: ' + String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      category,
      supplierName,
      warehouseName,
      dateSentToUs,
      dateSentToSupplier,
      description,
      dateResponseReceived,
      notes
    } = body;

    if (!category || !supplierName || !warehouseName || !dateSentToUs || !dateSentToSupplier || !description) {
      return NextResponse.json(
        { success: false, error: 'All primary fields (Category, Supplier, Warehouse, Dates, Description) are required.' },
        { status: 400 }
      );
    }

    const created = await db.createComplaint({
      category: category.trim(),
      supplierName: supplierName.trim(),
      warehouseName: warehouseName.trim(),
      dateSentToUs: dateSentToUs.trim(),
      dateSentToSupplier: dateSentToSupplier.trim(),
      description: description.trim(),
      dateResponseReceived: dateResponseReceived ? dateResponseReceived.trim() : null,
      notes: notes ? notes.trim() : undefined
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create complaint: ' + String(error) },
      { status: 500 }
    );
  }
}
