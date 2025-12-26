import { Row, Col, Card, Statistic } from "antd";
import {
  UserOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";

export default function SummaryCards({ summary }: any) {
  return (
    <Row gutter={16}>
      <Col span={6}>
        <Card hoverable>
          <Statistic title="Người dùng" value={summary.totalUsers} prefix={<UserOutlined />} />
        </Card>
      </Col>
      <Col span={6}>
        <Card hoverable>
          <Statistic title="Đơn hàng" value={summary.totalOrders} prefix={<ShoppingCartOutlined />} />
        </Card>
      </Col>
      <Col span={6}>
        <Card hoverable>
          <Statistic title="Doanh thu" value={summary.totalRevenue} prefix={<DollarOutlined />} />
        </Card>
      </Col>
      <Col span={6}>
        <Card hoverable>
          <Statistic title="Sản phẩm" value={summary.totalProducts} prefix={<AppstoreOutlined />} />
        </Card>
      </Col>
    </Row>
  );
}
