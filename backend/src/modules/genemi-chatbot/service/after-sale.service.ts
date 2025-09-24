import { Injectable } from "@nestjs/common";

@Injectable()
export class AfterSaleService {
	private readonly afterSaleService = new Map<string, string>([
		[
			'complain',
			`Nếu sản phẩm bị lỗi, hư hỏng, hoặc không đúng mô tả, bạn có thể gửi khiếu nại ngay trong ứng dụng.
				Cách thực hiện:
				Vào mục Đơn hàng của tôi → chọn đơn cần khiếu nại.
				Nhấn “Khiếu nại/Phản hồi”.
				Chọn lý do: Hàng lỗi, Sai sản phẩm, Thiếu hàng, v.v.
				Tải ảnh/video chứng minh để nhân viên kiểm tra nhanh.`
		],
		[
			'return/refund',
			`Điều kiện: sản phẩm còn nguyên tem, trong thời hạn đổi/trả theo chính sách.
			Các bước:
			Vào chi tiết đơn hàng → chọn “Trả hàng/Hoàn tiền”.
			Chọn hình thức: Trả hàng trước – hoàn tiền sau hoặc Hoàn tiền trước – giữ hàng (tùy chính sách).
			Chọn phương thức hoàn tiền (về ví điện tử, tài khoản ngân hàng, hoặc COD).
			Theo dõi trạng thái yêu cầu trong mục Hỗ trợ đơn hàng.`
		],
		[
			'connect-support-client',
			'Tôi sẽ giúp bạn kết nối với bộ phận hỗ trợ...'
		]
	])

	async handleConnectToSupport() {
		// TODO: Implement logic to connect user with support team
		// Could integrate with:
		// - Live chat system (Socket.io)
		// - Ticketing system 
		// - Email notification to support team

		return {
			message: 'Đang kết nối bạn với bộ phận hỗ trợ khách hàng...',
			action: 'connecting_to_support',
			success: true
		};
	}

	handleAfterSale(afterSaleReq: string) {
		const message = this.afterSaleService.get(afterSaleReq);

		if (message) {
			return {
				message,
				success: true
			};
		}

		return {
			message: 'Không tìm thấy thông tin hỗ trợ phù hợp.',
			success: false
		};
	}

}