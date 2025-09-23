import { Injectable } from "@nestjs/common";

@Injectable()
export class FaqService {
	private readonly FAQ = [
		{ type: 'FAQ' as const, title: 'Chính sách đổi/trả hàng', payload: 'privacy_change_or_refund' },
		{ type: 'FAQ' as const, title: 'Phí ship, thời gian giao hàng.', payload: 'price_or_time_ship' },
		{ type: 'FAQ' as const, title: 'Chính sách bảo hành.', payload: 'warranty_privacy' },
		{ type: 'FAQ' as const, title: 'Khuyến mãi hiện tại.', payload: 'promotion' },
		{ type: 'FAQ' as const, title: 'Hướng dẫn thanh toán.', payload: 'payment_tutorial' }
	]

	private readonly replies = new Map<string, string>([
		['privacy_change_or_refund', `
		📦 Chính sách đổi/trả hàng
		Khách được đổi/trả trong vòng 7 - 14 ngày kể từ ngày nhận hàng (tuỳ shop quy định).
		Sản phẩm phải còn nguyên tem, nhãn, chưa qua sử dụng.
		Các sản phẩm giảm giá, thuộc danh mục đặc biệt có thể không áp dụng đổi/trả.
		Chi phí đổi/trả:
		Do lỗi nhà bán (hàng lỗi, giao sai) → Shop chịu phí.
		Do khách đổi ý → Khách chịu phí ship.`],
		['price_or_time_ship', `
		🚚 Phí ship & thời gian giao hàng
		Phí ship: Tính theo khu vực (nội thành, ngoại thành, tỉnh xa).
		Miễn phí ship cho đơn hàng từ X₫ (tuỳ chương trình).
		Thời gian giao hàng:
		Nội thành: 1 – 2 ngày.
		Ngoại thành / tỉnh: 3 – 5 ngày.
		Vùng xa: 5 – 7 ngày.
		Hỗ trợ giao nhanh (hoả tốc, trong ngày) nếu có.
		`],
		['warranty_privacy', `
		🛠 Chính sách bảo hành
		Áp dụng cho các sản phẩm điện tử, gia dụng, phụ kiện công nghệ.
		Thời hạn bảo hành: 6 – 24 tháng (theo nhà sản xuất).
		Hình thức: đổi mới, sửa chữa miễn phí hoặc hoàn tiền (nếu không khắc phục được).
		Khách cần cung cấp hoá đơn/phiếu bảo hành khi yêu cầu hỗ trợ.
		`],
		['promotion', `
		🎉 Khuyến mãi hiện tại
		Voucher giảm giá theo đơn hàng (VD: -10% cho đơn trên 500k).
		Flash sale: Giờ vàng mỗi ngày.
		Mua kèm deal sốc: Giảm giá sản phẩm đi kèm.
		Freeship Extra (nếu tích hợp với sàn như Shopee, Lazada).
		`],
		['payment_tutorial', `
		💳 Hướng dẫn thanh toán
		Thanh toán khi nhận hàng (COD).
		Chuyển khoản ngân hàng (có thông tin tài khoản rõ ràng).
		Ví điện tử: Momo, ZaloPay, ShopeePay, VNPay…
		Thẻ tín dụng/ghi nợ quốc tế (Visa, MasterCard).
		Hỗ trợ trả góp 0% (nếu là sản phẩm giá trị cao).
		`],
	])

	handleFaq(payload: string) {
		const faqItem = this.FAQ.find(f => f.payload === payload)
		const reply = this.replies.get(payload)
		if (faqItem && reply) {
			return {
				message: faqItem.title,
				suggestionActions: reply
			}
		}
		return {
			message: 'Không tìm thấy thông tin phù hợp.',
			suggestionActions: null
		}
	}
}