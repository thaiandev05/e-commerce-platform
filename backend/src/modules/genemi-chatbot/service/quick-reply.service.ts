import { Injectable } from "@nestjs/common";

@Injectable()
export class QuickReplyService {
	private readonly templates = {
		greeting: {
			message: `
			Xin chào! 👋 Tôi là trợ lý AI của cửa hàng. 
			Tôi có thể giúp bạn:
			🛍️ Tìm kiếm sản phẩm
			📦 Kiểm tra đơn hàng  
			💡 Tư vấn mua sắm
			📞 Thông tin liên hệ
			Bạn cần hỗ trợ gì hôm nay?`,
			quickReplies: [
				{ type: 'QUICK_REPLY' as const, title: `🔍 Tìm sản phẩm`, payload: 'search_product' },
				{ type: 'QUICK_REPLY' as const, title: '📦 Kiểm tra đơn hàng', payload: 'check_order' },
				{ type: 'QUICK_REPLY' as const, title: '💰 Xem khuyến mãi', payload: 'view_promotions' },
				{ type: 'QUICK_REPLY' as const, title: '📞 Liên hệ', payload: 'contact_info' }
			]
		},
		product_categories: {
			message: `Chọn danh mục sản phẩm bạn quan tâm : `,
			quickReplies: [
				{ type: 'QUICK_REPLY' as const, title: '👕 Thời trang', payload: 'category_fashion' },
				{ type: 'QUICK_REPLY' as const, title: '📱 Điện tử', payload: 'category_electronics' },
				{ type: 'QUICK_REPLY' as const, title: '🏠 Gia dụng', payload: 'category_home' },
				{ type: 'QUICK_REPLY' as const, title: '🍔 Thực phẩm', payload: 'category_food' },
				{ type: 'QUICK_REPLY' as const, title: '⚽ Thể thao', payload: 'category_sports' },
				{ type: 'QUICK_REPLY' as const, title: '📚 Sách', payload: 'category_books' }
			]
		},
		order_support: {
			message: `Hỗ trợ đơn hàng 📦
			Tôi có thể giúp bạn:
			• Kiểm tra trạng thái đơn hàng
			• Thông tin vận chuyển
			• Thay đổi địa chỉ giao hàng
			• Hủy đơn hàng (trong vòng 24h)`,
			quickReplies: [
				{ type: 'QUICK_REPLY' as const, title: '📋 Trạng thái đơn hàng', payload: 'order_status' },
				{ type: 'QUICK_REPLY' as const, title: '🚚 Thông tin vận chuyển', payload: 'shipping_info' },
				{ type: 'QUICK_REPLY' as const, title: '📍 Thay đổi địa chỉ', payload: 'change_address' },
				{ type: 'QUICK_REPLY' as const, title: '❌ Hủy đơn hàng', payload: 'cancel_order' }
			]
		},
		contact_info: {
			message: `
			📞 Thông tin liên hệ

			🏪 **Địa chỉ cửa hàng:**
			123 Evernew, NewYork
			📱 **Hotline** 12341234
			📧 **Email:** email@support.com
			🕘 **Giờ làm việc:**
			Thứ 2 - Chủ Nhật: 8:00 - 22:00

			💬 Chat trực tuyến:** 24/7`,
			quickReplies: [
				{ type: 'QUICK_REPLY' as const, title: '💬 Chat với nhân viên', payload: 'human_support' },
				{ type: 'QUICK_REPLY' as const, title: '📞 Gọi hotline', payload: 'call_hotline' },
				{ type: 'QUICK_REPLY' as const, title: '🗺️ Xem bản đồ', payload: 'view_map' },
				{ type: 'QUICK_REPLY' as const, title: '🔙 Quay lại', payload: 'main_menu' }
			]
		},
		human_support: {
			message: `
			Đang kết nối với nhân viên hỗ trợ...

			Vui lòng chờ trong giây lát. Nhân viên sẽ hộ trợ bạn trong vòng 2-3 phút.
			📋 **Thông tin cần chuẩn bị:**
			• Mã đơn hàng (nếu có)  
			• Mô tả chi tiết vấn đề
			• Số điện thoại liên hệ`,
			quickReplies: [
				{ type: 'QUICK_REPLY', title: '📞 Gọi ngay', payload: 'call_hotline' },
				{ type: 'QUICK_REPLY', title: '🔙 Quay lại', payload: 'main_menu' }
			],
		}
	}

	handleQuickReplies(payload: string) {
		switch (payload) {
			case 'search_product':
				return {
					message: this.templates.product_categories.message,
					suggestedActions: this.templates.product_categories.quickReplies,
					sessionId: ''
				}
			case 'check_order':
				return {
					message: this.templates.order_support.message,
					suggestedActions: this.templates.order_support.quickReplies,
					sessionId: ''
				}
			case 'contact_info':
				return {
					message: this.templates.contact_info.message,
					suggestedActions: this.templates.contact_info.quickReplies,
					sessionId: ''
				}
			case 'human_support':
				return {
					message: this.templates.human_support.message,
					suggestedActions: this.templates.human_support.quickReplies,
					sessionId: ''
				}
		}
	}

	getGreetingResponse() {
		return {
			message: this.templates.greeting.message,
			suggestedActions: this.templates.greeting.quickReplies,
			sessionId: ''
		}
	}

	buildFAQResponse(question: string) {
		const fagMap: { [key: string]: string } = {
			'giờ mở cửa': `
			🕘 **Giờ làm việc của cửa hàng:**

			📅 Thứ 2 - Chủ nhật: 8:00 - 22:00
			🎉 Ngày lễ: 9:00 - 21:00

			💬 **Chat online:** 24/7
			📞 **Hotline:** 1900-1234 (24/7)`,

			'chính sách đổi trả': `
			🔄 **Chính sách đổi trả:**

			✅ **Được đổi trả trong 7 ngày**
			• Sản phẩm còn nguyên tem, mác
			• Không sử dụng, không hư hỏng
			• Có hóa đơn mua hàng

			❌ **Không đổi trả:**  
			• Sản phẩm đã qua sử dụng
			• Quần áo lót, mỹ phẩm đã mở
			• Sản phẩm giảm giá >50%`,

			'phí vận chuyển': `
			🚚 **Phí vận chuyển:**

			🆓 **MIỄN PHÍ** với đơn hàng >500.000đ
			📦 **30.000đ** với đơn hàng <500.000đ

			⚡ **Giao nhanh 2h:** +20.000đ
			🌙 **Giao buổi tối:** +10.000đ
			📅 **Hẹn giờ giao:** MIỄN PHÍ`
		}

		const normalQuestions = question.toLowerCase()
		for (const [key, answer] of Object.entries(fagMap)) {
			return {
				message: answer,
				suggestedActions: [
					{ type: 'QUICK_REPLY', title: '❓ Câu hỏi khác', payload: 'other_question' },
					{ type: 'QUICK_REPLY', title: '💬 Chat nhân viên', payload: 'human_support' },
					{ type: 'QUICK_REPLY', title: '🔙 Quay lại', payload: 'main_menu' }
				],
				sessionId: ''
			}
		}

		return null
	}
}