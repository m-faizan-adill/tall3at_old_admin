import api from "../services/api";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// -------------------------------- PDF - PRINT - CSV --------------------------------
// --------------------------------********************--------------------------------


// -------------------------------- B O O K I N G S --------------------------------
// Detail View PDF 
export const generateBookingDetailPDF = async ({
    booking,
    parsedAddOns,
    statusMap,
    formatDate,
    formatTime,
    extractDateFromDateTime,
    formatIdentity,
    formatPhone,
    setIsGeneratingPDF,
    setError,
    setSuccessModal,
    contentRef
}) => {
    if (!contentRef.current) return;

    setIsGeneratingPDF(true);

    try {
        // Create invoice-like PDF container
        const pdfContainer = document.createElement('div');
        pdfContainer.style.width = '1200px';
        pdfContainer.style.padding = '30px';
        pdfContainer.style.backgroundColor = '#ffffff';
        pdfContainer.style.fontFamily = 'Cairo, Tajawal, Noto Kufi Arabic, Arial, sans-serif';
        pdfContainer.style.fontSize = '16px';
        pdfContainer.style.lineHeight = '1.5';
        pdfContainer.style.color = '#1e293b';

        // Invoice Header
        const header = document.createElement('div');
        header.style.display = 'grid';
        header.style.gridTemplateColumns = '1fr 1fr';
        header.style.gap = '40px';
        header.style.marginBottom = '40px';
        header.style.paddingBottom = '20px';
        header.style.borderBottom = '3px solid #31beb5';

        // Left side - Company Info
        const companyInfo = document.createElement('div');
        companyInfo.style.textAlign = 'right';

        const companyTitle = document.createElement('h1');
        companyTitle.textContent = 'تطبيق طلعات';
        companyTitle.style.fontSize = '36px';
        companyTitle.style.fontWeight = '700';
        companyTitle.style.color = '#31beb5';
        companyTitle.style.margin = '0 0 15px 0';
        companyInfo.appendChild(companyTitle);



        const companySubtitle = document.createElement('p');
        companySubtitle.textContent = 'نظام إدارة الحجوزات';
        companySubtitle.style.fontSize = '20px';
        companySubtitle.style.color = '#64748b';
        companyInfo.appendChild(companySubtitle);

        const invoiceInfo = document.createElement('div');
        invoiceInfo.style.fontSize = '18px';
        invoiceInfo.style.color = '#64748b';
        invoiceInfo.innerHTML = `
        <div style="margin-bottom: 5px;color">رقم الحجز: #${booking.id}</div>
        <div style="margin-bottom: 5px;">تاريخ الحجز: ${formatDate(booking.createdAt)}</div>
        <div>الحالة: ${statusMap[booking.status]?.text || booking.status}</div>
      `;
        companyInfo.appendChild(invoiceInfo);

        header.appendChild(companyInfo);

        // Right side - Booking Details
        const bookingInfo = document.createElement('div');
        bookingInfo.style.textAlign = 'left';

        const bookingTitle = document.createElement('h2');
        bookingTitle.textContent = 'تفاصيل الحجز';
        bookingTitle.style.fontSize = '24px';
        bookingTitle.style.fontWeight = '600';
        bookingTitle.style.color = '#1e293b';
        bookingTitle.style.margin = '0 0 20px 0';
        bookingInfo.appendChild(bookingTitle);

        const bookingDetails = document.createElement('div');
        bookingDetails.style.fontSize = '18px';
        bookingDetails.style.color = '#64748b';
        bookingDetails.innerHTML = `
        <div style="margin-bottom: 8px;">عدد الأشخاص: ${booking.persons} شخص</div>
        <div style="margin-bottom: 8px;">عدد الساعات: ${booking.numberOfHours || booking.numOfHours} ساعات</div>
        <div style="margin-bottom: 8px;">وقت البدء: ${formatTime(booking.startTime)} - ${formatDate(extractDateFromDateTime(booking.startTime))}</div>
        <div>وقت الانتهاء: ${formatTime(booking.endTime)} - ${formatDate(extractDateFromDateTime(booking.endTime))}</div>
      `;
        bookingInfo.appendChild(bookingDetails);

        header.appendChild(bookingInfo);
        pdfContainer.appendChild(header);

        // Centered Header Text
        const centeredHeader = document.createElement('div');
        centeredHeader.style.textAlign = 'center';
        centeredHeader.style.marginBottom = '30px';
        centeredHeader.style.padding = '20px';

        const headerText = document.createElement('h2');
        const headerTripTitle = booking.trip?.title || 'رحلة غير محددة';
        headerText.textContent = `حجز رقم #${booking.id} - ${headerTripTitle}`;
        headerText.style.fontSize = '28px';
        headerText.style.fontWeight = '700';
        headerText.style.color = '#10b981';
        headerText.style.margin = '0';
        headerText.style.textAlign = 'center';

        centeredHeader.appendChild(headerText);
        pdfContainer.appendChild(centeredHeader);

        // Cost Breakdown Table
        const costTable = document.createElement('div');
        costTable.style.marginBottom = '30px';

        const costTitle = document.createElement('h3');
        costTitle.textContent = 'تفاصيل التكاليف';
        costTitle.style.fontSize = '22px';
        costTitle.style.fontWeight = '600';
        costTitle.style.color = '#1e293b';
        costTitle.style.margin = '0 0 20px 0';
        costTitle.style.textAlign = 'right';
        costTable.appendChild(costTitle);

        const costGrid = document.createElement('div');
        costGrid.style.display = 'grid';
        costGrid.style.gridTemplateColumns = '1fr 1fr 1fr 1fr';
        costGrid.style.gap = '15px';
        costGrid.style.marginBottom = '20px';

        const costItems = [
            { label: 'تكلفة الباكج', value: `${booking.cost} ريال`, color: '#f1f5f9' },
            { label: 'الإضافات', value: `${booking.addOnCost} ريال`, color: '#f1f5f9' },
            { label: 'عمولة التطبيق', value: `${booking.appCommission} ريال`, color: '#fef3c7' },
            { label: 'عمولة المزود', value: `${booking.providerCommission} ريال`, color: '#fef3c7' }
        ];

        costItems.forEach(item => {
            const costItem = document.createElement('div');
            costItem.style.padding = '15px';
            costItem.style.backgroundColor = item.color;
            costItem.style.borderRadius = '6px';
            costItem.style.textAlign = 'center';

            const label = document.createElement('div');
            label.textContent = item.label;
            label.style.fontSize = '16px';
            label.style.color = '#64748b';
            label.style.marginBottom = '8px';
            costItem.appendChild(label);

            const value = document.createElement('div');
            value.textContent = item.value;
            value.style.fontSize = '20px';
            value.style.fontWeight = '600';
            value.style.color = '#1e293b';
            costItem.appendChild(value);

            costGrid.appendChild(costItem);
        });

        costTable.appendChild(costGrid);

        // Total Cost
        const totalCost = document.createElement('div');
        totalCost.style.textAlign = 'center';
        totalCost.style.padding = '25px';
        totalCost.style.backgroundColor = '#31beb5';
        totalCost.style.color = '#ffffff';
        totalCost.style.borderRadius = '8px';
        totalCost.style.fontSize = '24px';
        totalCost.style.fontWeight = '700';
        totalCost.textContent = `التكلفة الإجمالية للطلعة: ${booking.totalCost} ريال`;
        costTable.appendChild(totalCost);

        pdfContainer.appendChild(costTable);

        // Customer and Provider Information Grid
        const userGrid = document.createElement('div');
        userGrid.style.display = 'grid';
        userGrid.style.gridTemplateColumns = '1fr 1fr';
        userGrid.style.gap = '30px';
        userGrid.style.marginBottom = '30px';

        // Customer Information
        const customerInfo = document.createElement('div');
        customerInfo.style.padding = '20px';
        customerInfo.style.backgroundColor = '#f8fafc';
        customerInfo.style.borderRadius = '8px';
        customerInfo.style.borderRight = '4px solid #31beb5';

        const customerTitle = document.createElement('h4');
        customerTitle.textContent = 'معلومات العميل';
        customerTitle.style.fontSize = '20px';
        customerTitle.style.fontWeight = '600';
        customerTitle.style.color = '#1e293b';
        customerTitle.style.margin = '0 0 20px 0';
        customerTitle.style.textAlign = 'right';
        customerInfo.appendChild(customerTitle);

        if (booking.user) {
            const customerDetails = document.createElement('div');
            customerDetails.style.fontSize = '16px';
            customerDetails.style.color = '#64748b';
            customerDetails.innerHTML = `
                ${booking.user.id ? `<div style="margin-bottom: 8px; text-align: right;">هوية: ${formatIdentity(booking.user.id)}</div>` : ''}

          <div style="margin-bottom: 8px; text-align: right;">الاسم: ${booking.user.fullName || 'غير محدد'}</div>
          <div style="margin-bottom: 8px; text-align: right;"> اسم المستخدم: ${formatPhone(booking.user.userName) || '-'}+</div>
          <div style="margin-bottom: 8px; text-align: right;">البريد الإلكتروني: ${booking.user.email || '-'}</div>
            ${booking.customerCity ? `<div style="margin-bottom: 8px; text-align: right;">المدينة: ${booking.customerCity}</div>` : ''}

        `;
            customerInfo.appendChild(customerDetails);
        } else {
            const noCustomer = document.createElement('p');
            noCustomer.textContent = 'لا توجد بيانات العميل';
            noCustomer.style.color = '#64748b';
            noCustomer.style.textAlign = 'right';
            customerInfo.appendChild(noCustomer);
        }

        userGrid.appendChild(customerInfo);

        // Provider Information
        const providerInfo = document.createElement('div');
        providerInfo.style.padding = '20px';
        providerInfo.style.backgroundColor = '#f8fafc';
        providerInfo.style.borderRadius = '8px';
        providerInfo.style.borderRight = '4px solid #31beb5';

        const providerTitle = document.createElement('h4');
        providerTitle.textContent = 'معلومات المزود';
        providerTitle.style.fontSize = '20px';
        providerTitle.style.fontWeight = '600';
        providerTitle.style.color = '#1e293b';
        providerTitle.style.margin = '0 0 20px 0';
        providerTitle.style.textAlign = 'right';
        providerInfo.appendChild(providerTitle);

        if (booking.provider) {
            const providerDetails = document.createElement('div');
            providerDetails.style.fontSize = '16px';
            providerDetails.style.color = '#64748b';

            providerDetails.innerHTML = `
        ${booking.provider.id ? `<div style="margin-bottom: 8px; text-align: right;">هوية: ${formatIdentity(booking.provider.id)}</div>` : ''}
  <div style="margin-bottom: 8px; text-align: right;">الاسم: ${booking.provider.fullName || 'غير محدد'}</div>
  <div style="margin-bottom: 8px; text-align: right;"> اسم المستخدم: ${formatPhone(booking.provider.userName) || '-'}+</div>
  <div style="margin-bottom: 8px; text-align: right;">البريد الإلكتروني: ${booking.provider.email || '-'}</div>
  ${booking.providerCity ? `<div style="margin-bottom: 8px; text-align: right;">المدينة: ${booking.providerCity}</div>` : ''}
`;

            providerInfo.appendChild(providerDetails);
        } else {
            const noProvider = document.createElement('p');
            noProvider.textContent = 'لا توجد بيانات المزود';
            noProvider.style.color = '#64748b';
            noProvider.style.textAlign = 'right';
            providerInfo.appendChild(noProvider);
        }

        userGrid.appendChild(providerInfo);
        pdfContainer.appendChild(userGrid);

        // Provider Bank Details Section - Simplified
        if (booking.provider && booking.provider.bankName) {
            const bankSection = document.createElement('div');
            bankSection.style.marginBottom = '30px';
            bankSection.style.padding = '20px';
            bankSection.style.backgroundColor = '#f1f5f9';
            bankSection.style.borderRadius = '8px';
            bankSection.style.border = '2px solid #31beb5';

            const bankTitle = document.createElement('h3');
            bankTitle.textContent = 'معلومات البنك';
            bankTitle.style.fontSize = '20px';
            bankTitle.style.fontWeight = '600';
            bankTitle.style.color = '#1e293b';
            bankTitle.style.margin = '0 0 15px 0';
            bankTitle.style.textAlign = 'right';
            bankSection.appendChild(bankTitle);

            const bankDetails = document.createElement('div');
            bankDetails.style.fontSize = '16px';
            bankDetails.style.color = '#64748b';
            bankDetails.style.textAlign = 'right';

            let bankInfo = '';
            if (booking.provider.bankName) {
                bankInfo += `<div>اسم البنك: <span style="font-weight: 600; color: #1e293b;">${booking.provider.bankName}</span></div>`;
            }
            if (booking.provider.ibanNumber) {
                bankInfo += `<div style="margin-bottom: 8px; text-align: right;">الآيبان: <span style="font-weight: 600; color: #1e293b;">${booking.provider.ibanNumber}</span></div>`;
            }
            if (booking.provider.accountName) {
                bankInfo += `<div style="margin-bottom: 8px; text-align: right;">الآيبان: <span style="font-weight: 600; color: #1e293b;">${booking.provider.accountName}</span></div>`;
            }

            bankDetails.innerHTML = bankInfo;
            bankSection.appendChild(bankDetails);

            pdfContainer.appendChild(bankSection);
        }

        // Trip and Add-ons Section - Last Section
        const tripAddonsRow = document.createElement('div');
        tripAddonsRow.style.display = 'grid';
        tripAddonsRow.style.gridTemplateColumns = '1fr 1fr';
        tripAddonsRow.style.gap = '20px';
        tripAddonsRow.style.marginBottom = '30px';

        // Trip Section - Left side
        const tripSection = document.createElement('div');
        tripSection.style.padding = '15px';
        tripSection.style.backgroundColor = '#f8fafc';
        tripSection.style.borderRadius = '8px';
        tripSection.style.border = '1px solid #31beb5';

        // Trip Header
        const tripHeader = document.createElement('div');
        tripHeader.style.display = 'flex';
        tripHeader.style.alignItems = 'center';
        tripHeader.style.marginBottom = '12px';
        tripHeader.style.justifyContent = 'start';

        const tripSectionTitle = document.createElement('h3');
        tripSectionTitle.textContent = 'تفاصيل الرحلة';
        tripSectionTitle.style.fontSize = '18px';
        tripSectionTitle.style.fontWeight = '600';
        tripSectionTitle.style.color = '#1e293b';
        tripSectionTitle.style.marginLeft = '8px';
        tripHeader.appendChild(tripSectionTitle);



        tripSection.appendChild(tripHeader);

        if (booking.trip) {
            // Simple trip info row
            const tripInfoRow = document.createElement('div');
            tripInfoRow.style.display = 'flex';
            tripInfoRow.style.justifyContent = 'space-between';
            tripInfoRow.style.alignItems = 'center';
            tripInfoRow.style.padding = '12px';
            tripInfoRow.style.backgroundColor = '#ffffff';
            tripInfoRow.style.borderRadius = '6px';
            tripInfoRow.style.border = '1px solid #e2e8f0';

            const tripInfo = document.createElement('div');
            tripInfo.style.textAlign = 'right';

            const tripName = document.createElement('div');
            tripName.textContent = booking.trip.title;
            tripName.style.fontSize = '16px';
            tripName.style.fontWeight = '600';
            tripName.style.color = '#1e293b';
            tripName.style.marginBottom = '4px';
            tripInfo.appendChild(tripName);

            const tripDetails = document.createElement('div');
            tripDetails.style.fontSize = '14px';
            tripDetails.style.color = '#64748b';
            tripDetails.innerHTML = `
          <span style="margin-left: 15px;">عدد الساعات: ${booking?.numOfHours || 'غير محدد'}</span>
          <span style="margin-left: 15px;">عدد الأشخاص: ${booking.persons}</span>
        `;
            tripInfo.appendChild(tripDetails);

            tripInfoRow.appendChild(tripInfo);

            const tripPrice = document.createElement('div');
            tripPrice.style.textAlign = 'center';
            tripPrice.style.padding = '8px 16px';
            tripPrice.style.color = '#000000';
            tripPrice.style.borderRadius = '6px';
            tripPrice.style.fontSize = '16px';
            tripPrice.style.fontWeight = '600';
            tripPrice.textContent = `${booking.trip.price} ريال / ${booking.numOfHours} ساعات`;
            tripInfoRow.appendChild(tripPrice);

            tripSection.appendChild(tripInfoRow);

        } else {
            // No trip data - simplified
            const noTripText = document.createElement('div');
            noTripText.style.padding = '12px';
            noTripText.style.textAlign = 'center';
            noTripText.style.color = '#64748b';
            noTripText.style.fontSize = '14px';
            noTripText.textContent = 'لا توجد بيانات رحلة متاحة';
            tripSection.appendChild(noTripText);
        }

        tripAddonsRow.appendChild(tripSection);

        // Add-ons Section - Right side
        const addonsSection = document.createElement('div');
        addonsSection.style.padding = '15px';
        addonsSection.style.backgroundColor = '#f8fafc';
        addonsSection.style.borderRadius = '8px';
        addonsSection.style.border = '1px solid #31beb5';

        const addonsTitle = document.createElement('h3');
        addonsTitle.textContent = 'الإضافات المختارة';
        addonsTitle.style.fontSize = '18px';
        addonsTitle.style.fontWeight = '600';
        addonsTitle.style.color = '#1e293b';
        addonsTitle.style.margin = '0 0 12px 0';
        addonsTitle.style.textAlign = 'right';
        addonsSection.appendChild(addonsTitle);

        if (parsedAddOns && Array.isArray(parsedAddOns) && parsedAddOns.length > 0) {
            const addonsList = document.createElement('div');
            addonsList.style.fontSize = '14px';
            addonsList.style.color = '#64748b';

            parsedAddOns.forEach((addon, index) => {
                const addonItem = document.createElement('div');
                addonItem.style.padding = '8px 12px';
                addonItem.style.backgroundColor = '#ffffff';
                addonItem.style.borderRadius = '6px';
                addonItem.style.border = '1px solid #e2e8f0';
                addonItem.style.marginBottom = '8px';
                addonItem.style.textAlign = 'right';

                const addonName = document.createElement('div');
                addonName.textContent = addon.Name || addon.NameEn || `إضافة ${index + 1}`;
                addonName.style.fontSize = '14px';
                addonName.style.fontWeight = '600';
                addonName.style.color = '#1e293b';
                addonName.style.marginBottom = '4px';
                addonItem.appendChild(addonName);

                const addonDetails = document.createElement('div');
                addonDetails.style.fontSize = '12px';
                addonDetails.style.color = '#64748b';

                let detailsText = '';
                if (addon.Quantity) detailsText += `الكمية: ${addon.Quantity} | `;
                if (addon.Price) detailsText += `السعر: ${addon.Price} ريال`;

                if (addon.Quantity && addon.Price) {
                    detailsText += ` | المجموع: ${(addon.Quantity * addon.Price).toFixed(2)} ريال`;
                }

                addonDetails.textContent = detailsText;
                addonItem.appendChild(addonDetails);

                addonsList.appendChild(addonItem);
            });

            addonsSection.appendChild(addonsList);
        } else {
            // Empty add-ons section placeholder
            const emptyAddonsText = document.createElement('div');
            emptyAddonsText.style.padding = '12px';
            emptyAddonsText.style.textAlign = 'center';
            emptyAddonsText.style.color = '#64748b';
            emptyAddonsText.style.fontSize = '14px';
            emptyAddonsText.textContent = 'لا توجد إضافات';
            addonsSection.appendChild(emptyAddonsText);
        }

        tripAddonsRow.appendChild(addonsSection);
        pdfContainer.appendChild(tripAddonsRow);

        // Footer
        const footer = document.createElement('div');
        footer.style.marginTop = '40px';
        footer.style.paddingTop = '20px';
        footer.style.borderTop = '2px solid #e2e8f0';
        footer.style.textAlign = 'center';
        footer.style.fontSize = '16px';
        footer.style.color = '#64748b';
        footer.innerHTML = `
        <div style="margin-bottom: 10px;">تم إنشاء هذا التقرير بواسطة نظام طلعات الإداري</div>
        <div>تاريخ الإنشاء: ${formatDate(booking.createdAt)}</div>
      `;
        pdfContainer.appendChild(footer);

        // Temporarily append PDF container to body
        pdfContainer.style.position = 'absolute';
        pdfContainer.style.left = '-9999px';
        pdfContainer.style.top = '0';
        document.body.appendChild(pdfContainer);

        // No images to wait for - removed for cleaner PDF

        // Generate canvas
        const canvas = await html2canvas(pdfContainer, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            width: 1200,
            height: pdfContainer.scrollHeight,
            scrollX: 0,
            scrollY: 0,
            windowWidth: 1200,
            windowHeight: pdfContainer.scrollHeight,
            imageTimeout: 10000,
            logging: false,
            removeContainer: true
        });

        // Remove PDF container from DOM
        document.body.removeChild(pdfContainer);

        // Create PDF
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        // Add border to the entire PDF page
        pdf.setDrawColor(49, 190, 181); // #31beb5 color
        pdf.setLineWidth(1);
        pdf.rect(5, 5, pdfWidth - 10, pdfHeight - 10);

        // Calculate image dimensions with border consideration
        const imgWidth = pdfWidth - 30; // Reduced width to account for border
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Check if content fits on one page
        if (imgHeight <= pdfHeight - 30) {
            // Single page
            pdf.addImage(imgData, 'PNG', 15, 15, imgWidth, imgHeight);
        } else {
            // Multiple pages if needed
            let heightLeft = imgHeight;
            let position = 15;

            pdf.addImage(imgData, 'PNG', 15, position, imgWidth, imgHeight);
            heightLeft -= (pdfHeight - 30);

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight + 15;
                pdf.addPage();
                // Add border to new page
                pdf.setDrawColor(49, 190, 181);
                pdf.setLineWidth(1);
                pdf.rect(5, 5, pdfWidth - 10, pdfHeight - 10);
                pdf.addImage(imgData, 'PNG', 15, position, imgWidth, imgHeight);
                heightLeft -= (pdfHeight - 30);
            }
        }

        // Save PDF with Arabic filename
        const tripTitle = booking.trip?.title || 'رحلة غير محددة';
        const fileName = `حجز رقم #${booking.id} - ${tripTitle}.pdf`;
        pdf.save(fileName);

        setSuccessModal({ isVisible: true, message: 'تم إنشاء ملف PDF بنجاح' });
        setTimeout(() => {
            setSuccessModal({ isVisible: false, message: '' });
        }, 2000);

    } catch (error) {
        console.error('Error generating PDF:', error);
        setError('فشل في إنشاء ملف PDF');
    } finally {
        setIsGeneratingPDF(false);
    }
};

// List CSV
export const exportBookingsListCSV = async (setError) => {
    try {
        // setExporting(true);
        const params = new URLSearchParams({
            role: 'bookings',
            format: 'csv'
        });

        console.log('Exporting providers with params:', params.toString(), params);

        const res = await api.get(`/api/admin/bookings/export?${params}`, {
            responseType: 'arraybuffer',
            timeout: 60000,
            // optional but helpful:
            headers: { Accept: 'text/csv, application/octet-stream, */*' },
            validateStatus: s => s >= 200 && s < 300 // force throw on non-2xx
        });

        // --- check server content-type (maybe returned JSON error) ---
        const ct = (res.headers?.['content-type'] || '').toLowerCase();
        if (ct.includes('application/json') || ct.includes('text/json')) {
            const txt = new TextDecoder('utf-8').decode(res.data);
            let msg = 'Server returned JSON instead of CSV.';
            try { msg = JSON.parse(txt)?.message || msg; } catch { }
            throw new Error(msg);
        }


        // --- CSV download with UTF-8 BOM for Arabic ---
        const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
        let csvText = new TextDecoder('utf-8').decode(res.data);

        // helpers: CSV-safe split/join
        const smartSplit = (line) => {
            const out = [];
            let s = '', q = false;
            for (let i = 0; i < line.length; i++) {
                const c = line[i];
                if (c === '"') {
                    if (q && line[i + 1] === '"') { s += '"'; i++; }
                    else q = !q;
                } else if (c === ',' && !q) {
                    out.push(s); s = '';
                } else {
                    s += c;
                }
            }
            out.push(s);
            return out;
        };
        const toCSVLine = (arr) =>
            arr.map(v => {
                v = v ?? '';
                const needsQuotes = /[",\n]/.test(v);
                if (!needsQuotes) return v;
                return `"${String(v).replace(/"/g, '""')}"`;
            }).join(',');

        // split rows
        let rows = csvText.split(/\r?\n/).filter(r => r.trim() !== '');
        if (rows.length === 0) throw new Error('Empty CSV');

        let headers = smartSplit(rows[0]);
        const dropHeaders = [/^\s*price\s*$/i, /^\s*discountedprice\s*$/i];

        // find indexes to remove
        const dropIndexes = headers
            .map((h, idx) => dropHeaders.some(rx => rx.test(h)) ? idx : -1)
            .filter(idx => idx !== -1);

        // remove in reverse order so indexes don’t shift
        dropIndexes.sort((a, b) => b - a);

        dropIndexes.forEach(idx => {
            headers.splice(idx, 1);
            for (let r = 1; r < rows.length; r++) {
                const cols = smartSplit(rows[r]);
                cols.splice(idx, 1);
                rows[r] = toCSVLine(cols);
            }
        });

        // rebuild CSV
        rows[0] = toCSVLine(headers);
        csvText = rows.join('\n');

        // download
        const blob = new Blob([bom, csvText], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'bookings.csv';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);

    } catch (err) {
        // Axios/network/server error parsing
        let message = 'Failed to export data';
        if (err?.response?.data) {
            try {
                const txt = new TextDecoder('utf-8').decode(err.response.data);
                const j = JSON.parse(txt);
                message = j.message || txt || message;
            } catch {
                message = err?.message || message;
            }
        } else if (err?.message) {
            message = err.message;
        }
        console.error('Export error:', err);
        setError(message);
    }
};

// List PDF Print
export const printBookingsListPDF = (bookings, statusMap, formatDate, setError) => {
    try {
        const printWindow = window.open('', '_blank');
        const printContent = `
        <!DOCTYPE html>
        <html dir="rtl">
        <head>
          <title>قائمة الحجوزات - طلعات</title>
          <style>
            body { font-family: 'Cairo', 'Tajawal', 'Noto Kufi Arabic', Arial, sans-serif; margin: 20px; direction: rtl; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #1fc1de; padding-bottom: 20px; }
            .header h1 { color: #1fc1de; margin: 0; font-size: 24px; }
            .header p { color: #666; margin: 5px 0 0 0; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
            th { background-color: #f8f9fa; font-weight: bold; color: #1fc1de; }
            .status-completed { color: #10b981; font-weight: bold; }
            .status-pending { color: #f59e0b; font-weight: bold; }
            .status-canceled { color: #ef4444; font-weight: bold; }
            @media print { body { margin: 0; } .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>قائمة الحجوزات</h1>
            <p>تطبيق طلعات - ${new Date().toLocaleDateString('ar-SA')}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>المعرف</th>
                <th>الرحلة</th>
                <th>المستخدم</th>
                <th>المزود</th>
                <th>الحالة</th>
                <th>التكلفة</th>
                <th>عدد الأشخاص</th>
                <th>تاريخ الحجز</th>
              </tr>
            </thead>
            <tbody>
              ${bookings.map(b => `
                <tr>
                  <td>${b.id}</td>
                  <td>${b.tripTitle || '-'}</td>
                  <td>${b.userName || '-'}</td>
                  <td>${b.providerName || '-'}</td>
                  <td>${statusMap[b.status]?.text || b.status}</td>
                  <td>${b.totalCost} ريال</td>
                  <td>${b.persons}</td>
                  <td>${formatDate(b.bookingDate)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
        </html>
      `;
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    } catch (err) {
        setError('فشل في طباعة البيانات');
    }
};


// -------------------------------- C A T E G O R Y --------------------------------

// List CSV
export const exportCategoriesListCSV = async (setError) => {
    try {
        // setExporting(true);
        const params = new URLSearchParams({
            role: 'category',
            format: 'csv'
        });

        console.log('Exporting providers with params:', params.toString(), params);

        const res = await api.get(`/api/admin/categories/export?${params}`, {
            responseType: 'arraybuffer',
            timeout: 60000,
            // optional but helpful:
            headers: { Accept: 'text/csv, application/octet-stream, */*' },
            validateStatus: s => s >= 200 && s < 300 // force throw on non-2xx
        });

        // --- check server content-type (maybe returned JSON error) ---
        const ct = (res.headers?.['content-type'] || '').toLowerCase();
        if (ct.includes('application/json') || ct.includes('text/json')) {
            const txt = new TextDecoder('utf-8').decode(res.data);
            let msg = 'Server returned JSON instead of CSV.';
            try { msg = JSON.parse(txt)?.message || msg; } catch { }
            throw new Error(msg);
        }


        // --- CSV download with UTF-8 BOM for Arabic ---
        const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
        let csvText = new TextDecoder('utf-8').decode(res.data);

        // helpers: CSV-safe split/join
        const smartSplit = (line) => {
            const out = [];
            let s = '', q = false;
            for (let i = 0; i < line.length; i++) {
                const c = line[i];
                if (c === '"') {
                    if (q && line[i + 1] === '"') { s += '"'; i++; }
                    else q = !q;
                } else if (c === ',' && !q) {
                    out.push(s); s = '';
                } else {
                    s += c;
                }
            }
            out.push(s);
            return out;
        };
        const toCSVLine = (arr) =>
            arr.map(v => {
                v = v ?? '';
                const needsQuotes = /[",\n]/.test(v);
                if (!needsQuotes) return v;
                return `"${String(v).replace(/"/g, '""')}"`;
            }).join(',');

        // split rows
        let rows = csvText.split(/\r?\n/).filter(r => r.trim() !== '');
        if (rows.length === 0) throw new Error('Empty CSV');

        let headers = smartSplit(rows[0]);
        const dropHeaders = [/^\s*price\s*$/i, /^\s*discountedprice\s*$/i];

        // find indexes to remove
        const dropIndexes = headers
            .map((h, idx) => dropHeaders.some(rx => rx.test(h)) ? idx : -1)
            .filter(idx => idx !== -1);

        // remove in reverse order so indexes don’t shift
        dropIndexes.sort((a, b) => b - a);

        dropIndexes.forEach(idx => {
            headers.splice(idx, 1);
            for (let r = 1; r < rows.length; r++) {
                const cols = smartSplit(rows[r]);
                cols.splice(idx, 1);
                rows[r] = toCSVLine(cols);
            }
        });

        // rebuild CSV
        rows[0] = toCSVLine(headers);
        csvText = rows.join('\n');

        // download
        const blob = new Blob([bom, csvText], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'categories.csv';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);

    } catch (err) {
        // Axios/network/server error parsing
        let message = 'Failed to export data';
        if (err?.response?.data) {
            try {
                const txt = new TextDecoder('utf-8').decode(err.response.data);
                const j = JSON.parse(txt);
                message = j.message || txt || message;
            } catch {
                message = err?.message || message;
            }
        } else if (err?.message) {
            message = err.message;
        }
        console.error('Export error:', err);
        setError(message);
    }
};

// List PDF Print
export const printCategoriesListPDF = (categories, formatDate, setError) => {
    const printWindow = window.open('', '_blank');
    const printContent = `
      <html dir="rtl">
        <head>
          <title>قائمة الفئات</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: right; }
            th { background-color: #f8f9fa; font-weight: bold; }
            .status-active { color: #059669; }
            .status-inactive { color: #dc2626; }
            h1 { color: #1fc1de; text-align: center; }
            .print-date { text-align: left; color: #666; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <h1>قائمة الفئات</h1>
          <div class="print-date">تاريخ الطباعة: ${new Date().toLocaleDateString('ar-SA')}</div>
          <table>
            <thead>
              <tr>
                <th>الاسم</th>
                <th>الاسم بالإنجليزية</th>
                <th>الحالة</th>
                <th>عدد الرحلات</th>
                <th>عدد الحجوزات</th>
                <th>إجمالي الإيرادات</th>
                <th>تاريخ الإنشاء</th>
              </tr>
            </thead>
            <tbody>
              ${categories.map(category => `
                <tr>
                  <td>${category.name}</td>
                  <td>${category.nameEn || '-'}</td>
                  <td class="${category.active ? 'status-active' : 'status-inactive'}">
                    ${category.active ? 'نشط' : 'غير نشط'}
                  </td>
                  <td>${category.tripsCount}</td>
                  <td>${category.bookingsCount}</td>
                  <td>${category.totalRevenue || 0} ريال</td>
                  <td>${formatDate(category.createdAt)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
};


// -------------------------------- C U S T O M E R S --------------------------------
// List CSV
export const exportCustomersListCSV = async (filters = {}, setError) => {
    try {
        const params = new URLSearchParams({
            role: "customer",
            status: filters?.status ?? "",
            cityId: filters?.cityId ?? "",
            format: "csv",
        });

        console.log("Exporting customers with params:", params.toString(), params);

        const res = await api.get(`/api/admin/users/export?${params}`, {
            responseType: "arraybuffer",
            timeout: 60000,
            headers: { Accept: "text/csv, application/octet-stream, */*" },
            validateStatus: (s) => s >= 200 && s < 300,
        });

        // --- check server content-type (maybe returned JSON error) ---
        const ct = (res.headers?.["content-type"] || "").toLowerCase();
        if (ct.includes("application/json") || ct.includes("text/json")) {
            const txt = new TextDecoder("utf-8").decode(res.data);
            let msg = "Server returned JSON instead of CSV.";
            try {
                msg = JSON.parse(txt)?.message || msg;
            } catch { }
            throw new Error(msg);
        }

        // --- CSV download with UTF-8 BOM for Arabic ---
        const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
        let csvText = new TextDecoder("utf-8").decode(res.data);

        // helpers: CSV-safe split/join
        const smartSplit = (line) => {
            const out = [];
            let s = "",
                q = false;
            for (let i = 0; i < line.length; i++) {
                const c = line[i];
                if (c === '"') {
                    if (q && line[i + 1] === '"') {
                        s += '"';
                        i++;
                    } else q = !q;
                } else if (c === "," && !q) {
                    out.push(s);
                    s = "";
                } else {
                    s += c;
                }
            }
            out.push(s);
            return out;
        };

        const toCSVLine = (arr) =>
            arr
                .map((v) => {
                    v = v ?? "";
                    const needsQuotes = /[",\n]/.test(v);
                    if (!needsQuotes) return v;
                    return `"${String(v).replace(/"/g, '""')}"`;
                })
                .join(",");

        // split rows
        let rows = csvText.split(/\r?\n/).filter((r) => r.trim() !== "");
        if (rows.length === 0) throw new Error("Empty CSV");

        let headers = smartSplit(rows[0]);

        // 1️⃣ Rename "Username" → "Phone Number"
        headers = headers.map((h) =>
            /^\s*username\s*$/i.test(h) ? "Phone Number" : h
        );

        // 2️⃣ Remove "Phone" column
        let dropIdx = headers.findIndex((h) => /^\s*phone\s*$/i.test(h));
        if (dropIdx !== -1) {
            headers.splice(dropIdx, 1);
            for (let r = 1; r < rows.length; r++) {
                const cols = smartSplit(rows[r]);
                cols.splice(dropIdx, 1);
                rows[r] = toCSVLine(cols);
            }
        }

        // 3️⃣ Replace ID with S_last3DigitsOfPhone
        const idIdx = headers.findIndex((h) => /^\s*id\s*$/i.test(h));
        const phoneIdx = headers.findIndex((h) =>
            /^\s*phone\s*number\s*$/i.test(h)
        );

        if (idIdx !== -1 && phoneIdx !== -1) {
            for (let r = 1; r < rows.length; r++) {
                const cols = smartSplit(rows[r]);
                const phone = (cols[phoneIdx] || "").replace(/\D/g, "");
                const last3 = phone.slice(-3) || "000";
                cols[idIdx] = `S_${last3}`;
                rows[r] = toCSVLine(cols);
            }
        }

        rows[0] = toCSVLine(headers);
        csvText = rows.join("\n");

        // Download
        const blob = new Blob([bom, csvText], {
            type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "customers.csv";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    } catch (err) {
        let message = "Failed to export data";
        if (err?.response?.data) {
            try {
                const txt = new TextDecoder("utf-8").decode(err.response.data);
                const j = JSON.parse(txt);
                message = j.message || txt || message;
            } catch {
                message = err?.message || message;
            }
        } else if (err?.message) {
            message = err.message;
        }
        console.error("Export error:", err);
        if (setError) setError(message);
    }
};

// List PDF Print
export const printCustomersListPDF = (customers, getStatusText, formatDate, setError) => {
    try {
        // Create a print-friendly version of the customers table
        const printWindow = window.open('', '_blank');
        const printContent = `
        <!DOCTYPE html>
        <html dir="rtl">
        <head>
          <title>قائمة العملاء - طلعات</title>
          <style>
            body { 
              font-family: 'Cairo', 'Tajawal', 'Noto Kufi Arabic', Arial, sans-serif; 
              margin: 20px; 
              direction: rtl;
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
              border-bottom: 2px solid #1fc1de; 
              padding-bottom: 20px;
            }
            .header h1 { 
              color: #1fc1de; 
              margin: 0; 
              font-size: 24px;
            }
            .header p { 
              color: #666; 
              margin: 5px 0 0 0; 
              font-size: 14px;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 20px;
              font-size: 12px;
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 8px; 
              text-align: right;
            }
            th { 
              background-color: #f8f9fa; 
              font-weight: bold;
              color: #1fc1de;
            }
            .status-active { color: #10b981; font-weight: bold; }
            .status-pending { color: #f59e0b; font-weight: bold; }
            .status-suspended { color: #ef4444; font-weight: bold; }
            .status-deleted { color: #6b7280; font-weight: bold; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>قائمة العملاء</h1>
            <p>تطبيق طلعات - ${new Date().toLocaleDateString('ar-SA')}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>الاسم الكامل</th>
                <th>رقم الهاتف</th>
                <th>البريد الإلكتروني</th>
                <th>الحالة</th>
                <th>المدينة</th>
                <th>عدد الحجوزات</th>
                <th>إجمالي الإنفاق</th>
                <th>تاريخ الإنشاء</th>
              </tr>
            </thead>
            <tbody>
              ${customers.map(customer => `
                <tr>
                  <td>${customer.fullName}</td>
                  <td>${customer.userName}</td>
                  <td>${customer.email}</td>
                  <td class="status-${customer.status.toLowerCase()}">${getStatusText(customer.status)}</td>
                  <td>${customer.cityName || 'غير محدد'}</td>
                  <td>${customer.bookingsCount}</td>
                  <td>${customer.totalSpent?.toFixed(2) || '0'} ريال</td>
                  <td>${formatDate(customer.createdAt)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
        </html>
      `;

        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    } catch (err) {
        setError('فشل في طباعة البيانات');
        console.error('Error printing customers:', err);
    }
};

// -------------------------------- P R O V I D E R S --------------------------------
// List CSV
export const exportProvidersListCSV = async (filters = {}, setError) => {
    try {
        const params = new URLSearchParams({
            status: filters?.status ?? '',
            cityId: filters?.cityId ?? '',
            format: 'csv'
        });

        console.log('Exporting providers with params:', params.toString(), params);

        const res = await api.get(`/api/admin/providers/export?${params}`, {
            responseType: 'arraybuffer',
            timeout: 60000,
            // optional but helpful:
            headers: { Accept: 'text/csv, application/octet-stream, */*' },
            validateStatus: s => s >= 200 && s < 300 // force throw on non-2xx
        });

        // --- check server content-type (maybe returned JSON error) ---
        const ct = (res.headers?.['content-type'] || '').toLowerCase();
        if (ct.includes('application/json') || ct.includes('text/json')) {
            const txt = new TextDecoder('utf-8').decode(res.data);
            let msg = 'Server returned JSON instead of CSV.';
            try { msg = JSON.parse(txt)?.message || msg; } catch { }
            throw new Error(msg);
        }


        // --- CSV download with UTF-8 BOM for Arabic ---
        const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
        let csvText = new TextDecoder('utf-8').decode(res.data);

        // helpers: CSV-safe split/join
        const smartSplit = (line) => {
            const out = [];
            let s = '', q = false;
            for (let i = 0; i < line.length; i++) {
                const c = line[i];
                if (c === '"') {
                    if (q && line[i + 1] === '"') { s += '"'; i++; }
                    else q = !q;
                } else if (c === ',' && !q) {
                    out.push(s); s = '';
                } else {
                    s += c;
                }
            }
            out.push(s);
            return out;
        };
        const toCSVLine = (arr) =>
            arr.map(v => {
                v = v ?? '';
                const needsQuotes = /[",\n]/.test(v);
                if (!needsQuotes) return v;
                return `"${String(v).replace(/"/g, '""')}"`;
            }).join(',');

        // split rows
        let rows = csvText.split(/\r?\n/).filter(r => r.trim() !== '');
        if (rows.length === 0) throw new Error('Empty CSV');

        let headers = smartSplit(rows[0]);

        // 1) Rename "Username" → "Phone Number"
        headers = headers.map(h => (/^\s*username\s*$/i.test(h) ? 'Phone Number' : h));

        // 2) Remove unwanted "Phone" column completely
        let dropIdx = headers.findIndex(h => /^\s*phone\s*$/i.test(h));
        if (dropIdx !== -1) {
            headers.splice(dropIdx, 1);
            for (let r = 1; r < rows.length; r++) {
                const cols = smartSplit(rows[r]);
                cols.splice(dropIdx, 1);
                rows[r] = toCSVLine(cols);
            }
        }

        // 3) Replace ID with S_last3DigitsOfPhone
        const idIdx = headers.findIndex(h => /^\s*id\s*$/i.test(h));
        const phoneIdx = headers.findIndex(h => /^\s*phone\s*number\s*$/i.test(h));

        if (idIdx !== -1 && phoneIdx !== -1) {
            for (let r = 1; r < rows.length; r++) {
                const cols = smartSplit(rows[r]);
                const phone = (cols[phoneIdx] || '').replace(/\D/g, ''); // digits only
                const last3 = phone.slice(-3) || '000';
                cols[idIdx] = `S_${last3}`;
                rows[r] = toCSVLine(cols);
            }
        }

        // rebuild CSV
        rows[0] = toCSVLine(headers);
        csvText = rows.join('\n');

        // download
        const blob = new Blob([bom, csvText], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'providers.csv';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);

    } catch (err) {
        // Axios/network/server error parsing
        let message = 'Failed to export data';
        if (err?.response?.data) {
            try {
                const txt = new TextDecoder('utf-8').decode(err.response.data);
                const j = JSON.parse(txt);
                message = j.message || txt || message;
            } catch {
                message = err?.message || message;
            }
        } else if (err?.message) {
            message = err.message;
        }
        console.error('Export error:', err);
        setError(message);
    }
};

// List PDF Print
export const printProvidersListPDF = (providers, getStatusText, formatDate, setError) => {
    try {
        // Create a print-friendly version of the providers table
        const printWindow = window.open('', '_blank');
        const printContent = `
        <!DOCTYPE html>
        <html dir="rtl">
        <head>
          <title>قائمة المزودين - طلعات</title>
          <style>
            body { 
              font-family: 'Cairo', 'Tajawal', 'Noto Kufi Arabic', Arial, sans-serif; 
              margin: 20px; 
              direction: rtl;
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
              border-bottom: 2px solid #1fc1de; 
              padding-bottom: 20px;
            }
            .header h1 { 
              color: #1fc1de; 
              margin: 0; 
              font-size: 24px;
            }
            .header p { 
              color: #666; 
              margin: 5px 0 0 0; 
              font-size: 14px;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 20px;
              font-size: 12px;
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 8px; 
              text-align: right;
            }
            th { 
              background-color: #f8f9fa; 
              font-weight: bold;
              color: #1fc1de;
            }
            .status-active { color: #10b981; font-weight: bold; }
            .status-pending { color: #f59e0b; font-weight: bold; }
            .status-suspended { color: #ef4444; font-weight: bold; }
            .status-deleted { color: #6b7280; font-weight: bold; }
            .footer { 
              margin-top: 30px; 
              text-align: center; 
              color: #666; 
              font-size: 12px;
              border-top: 1px solid #ddd;
              padding-top: 20px;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>قائمة المزودين</h1>
            <p>نظام إدارة طلعات - ${new Date().toLocaleDateString('ar-SA')}</p>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>الاسم الكامل</th>
                <th>رقم الهاتف</th>
                <th>الحالة</th>
                <th>المدينة</th>
                <th>عدد الرحلات</th>
                <th>عدد الحجوزات</th>
                <th>إجمالي الأرباح</th>
                <th>تاريخ الإنشاء</th>
              </tr>
            </thead>
            <tbody>
              ${providers.map(provider => `
                <tr>
                  <td>${provider.fullName}</td>
                  <td>${provider.userName}</td>
                  <td class="status-${provider.status.toLowerCase()}">${getStatusText(provider.status)}</td>
                  <td>${provider.cityName}</td>
                  <td>${provider.tripsCount}</td>
                  <td>${provider.bookingsCount}</td>
                  <td>${provider.totalEarnings?.toFixed(2) || '0'} ريال</td>
                  <td>${formatDate(provider.createdAt)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            <p>تم الطباعة في: ${new Date().toLocaleString('ar-SA')}</p>
            <p>إجمالي المزودين: ${providers.length}</p>
          </div>
        </body>
        </html>
      `;

        printWindow.document.write(printContent);
        printWindow.document.close();

        // Wait for content to load then print
        printWindow.onload = function () {
            printWindow.print();
            printWindow.close();
        };
    } catch (err) {
        setError('فشل في طباعة البيانات');
        console.error('Error printing providers:', err);
    }
};

// -------------------------------- T R I P S --------------------------------

// List CSV
export const exportTripsListCSV = async (filters = {}, setError, setExporting) => {
    try {
        setExporting(true);
        const params = new URLSearchParams({
            role: 'trip',
            status: filters?.status ?? '',
            cityId: filters?.cityId ?? '',
            format: 'csv'
        });

        console.log('Exporting providers with params:', params.toString(), params);

        const res = await api.get(`/api/admin/trips/export?${params}`, {
            responseType: 'arraybuffer',
            timeout: 60000,
            // optional but helpful:
            headers: { Accept: 'text/csv, application/octet-stream, */*' },
            validateStatus: s => s >= 200 && s < 300 // force throw on non-2xx
        });

        // --- check server content-type (maybe returned JSON error) ---
        const ct = (res.headers?.['content-type'] || '').toLowerCase();
        if (ct.includes('application/json') || ct.includes('text/json')) {
            const txt = new TextDecoder('utf-8').decode(res.data);
            let msg = 'Server returned JSON instead of CSV.';
            try { msg = JSON.parse(txt)?.message || msg; } catch { }
            throw new Error(msg);
        }


        // --- CSV download with UTF-8 BOM for Arabic ---
        const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
        let csvText = new TextDecoder('utf-8').decode(res.data);

        // helpers: CSV-safe split/join
        const smartSplit = (line) => {
            const out = [];
            let s = '', q = false;
            for (let i = 0; i < line.length; i++) {
                const c = line[i];
                if (c === '"') {
                    if (q && line[i + 1] === '"') { s += '"'; i++; }
                    else q = !q;
                } else if (c === ',' && !q) {
                    out.push(s); s = '';
                } else {
                    s += c;
                }
            }
            out.push(s);
            return out;
        };
        const toCSVLine = (arr) =>
            arr.map(v => {
                v = v ?? '';
                const needsQuotes = /[",\n]/.test(v);
                if (!needsQuotes) return v;
                return `"${String(v).replace(/"/g, '""')}"`;
            }).join(',');

        // split rows
        let rows = csvText.split(/\r?\n/).filter(r => r.trim() !== '');
        if (rows.length === 0) throw new Error('Empty CSV');

        let headers = smartSplit(rows[0]);
        const dropHeaders = [/^\s*price\s*$/i, /^\s*discountedprice\s*$/i];

        // find indexes to remove
        const dropIndexes = headers
            .map((h, idx) => dropHeaders.some(rx => rx.test(h)) ? idx : -1)
            .filter(idx => idx !== -1);

        // remove in reverse order so indexes don’t shift
        dropIndexes.sort((a, b) => b - a);

        dropIndexes.forEach(idx => {
            headers.splice(idx, 1);
            for (let r = 1; r < rows.length; r++) {
                const cols = smartSplit(rows[r]);
                cols.splice(idx, 1);
                rows[r] = toCSVLine(cols);
            }
        });

        // rebuild CSV
        rows[0] = toCSVLine(headers);
        csvText = rows.join('\n');

        // download
        const blob = new Blob([bom, csvText], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'trips.csv';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);

    } catch (err) {
        // Axios/network/server error parsing
        let message = 'Failed to export data';
        if (err?.response?.data) {
            try {
                const txt = new TextDecoder('utf-8').decode(err.response.data);
                const j = JSON.parse(txt);
                message = j.message || txt || message;
            } catch {
                message = err?.message || message;
            }
        } else if (err?.message) {
            message = err.message;
        }
        console.error('Export error:', err);
        setError(message);
    } finally {
        setExporting(false);
    }
};

// List PDF Print
export const printTripsListPDF = (trips, getStatusText, formatDate, setError) => {
    try {
        const printWindow = window.open('', '_blank');
        const printContent = `
            <!DOCTYPE html>
            <html dir="rtl">
            <head>
              <title>قائمة الرحلات - طلعات</title>
              <style>
                body { 
                  font-family: 'Cairo', 'Tajawal', 'Noto Kufi Arabic', Arial, sans-serif; 
                  margin: 20px; 
                  direction: rtl;
                }
                .header { 
                  text-align: center; 
                  margin-bottom: 30px; 
                  border-bottom: 2px solid #1fc1de; 
                  padding-bottom: 20px;
                }
                .header h1 { 
                  color: #1fc1de; 
                  margin: 0; 
                  font-size: 24px;
                }
                .header p { 
                  color: #666; 
                  margin: 5px 0 0 0; 
                  font-size: 14px;
                }
                table { 
                  width: 100%; 
                  border-collapse: collapse; 
                  margin-top: 20px;
                  font-size: 12px;
                }
                th, td { 
                  border: 1px solid #ddd; 
                  padding: 8px; 
                  text-align: right;
                }
                th { 
                  background-color: #f8f9fa; 
                  font-weight: bold;
                  color: #1fc1de;
                }
                .status-active { color: #10b981; font-weight: bold; }
                .status-pending { color: #f59e0b; font-weight: bold; }
                .status-inactive { color: #ef4444; font-weight: bold; }
                @media print {
                  body { margin: 0; }
                  .no-print { display: none; }
                }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>قائمة الرحلات</h1>
                <p>تطبيق طلعات - ${new Date().toLocaleDateString('ar-SA')}</p>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>العنوان</th>
                    <th>المدينة</th>
                    <th>الفئة</th>
                    <th>الحالة</th>
                    <th>عدد الأشخاص</th>
                    <th>تاريخ الإنشاء</th>
                  </tr>
                </thead>
                <tbody>
                  ${trips.map(trip => `
                    <tr>
                      <td>${trip.title}</td>
                      <td>${trip.cityName || 'غير محدد'}</td>
                      <td>${trip.categoryName || 'غير محدد'}</td>
                      <td class="status-${trip.status.toLowerCase()}">${getStatusText(trip.status)}</td>
                      <td>${trip.maxPersons}</td>
                      <td>${formatDate(trip.createdAt)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </body>
            </html>
          `;

        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    } catch (err) {
        setError('فشل في طباعة البيانات');
        console.error('Error printing trips:', err);
    }
};
