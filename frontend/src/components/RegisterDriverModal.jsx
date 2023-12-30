import React from "react";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useDriverState } from "@/recoils/driver.state.js";
import { useUserState } from "@/recoils/user.state.js";
import { useMutation } from "@tanstack/react-query";
import { UploadImage } from "@/components/UploadImage";
import axios from "axios";
import {
  Button,
  Form,
  notification,
  Modal,
  InputNumber,
  Select,
  message,
} from "antd";

export default function RegisterDriverModal({
  openRegisterDriver,
  handleCancleRegisterDriver,
}) {
  const [form] = Form.useForm();
  const [user, setUser] = useUserState();
  const [driver, setDriver] = useDriverState();

  const [accessToken, setAccessToken, clearAccessToken] =
    useLocalStorage("access_token");

  const onSubmit = async (values) => {
    try {
      const did = driver?.result?._id || user?.result?.driverLicenses?._id;

      const response = await axios({
        method: did ? "put" : "post",
        url: did
          ? `${process.env.NEXT_PUBLIC_REACT_APP_BACKEND_URL}/drivers/updateDriver/${did}`
          : `${process.env.NEXT_PUBLIC_REACT_APP_BACKEND_URL}/drivers/registerDriver`,
        data: values,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        console.log(response.data);
        setDriver({ ...response.data });
        handleCancleRegisterDriver();
        const successMessage =
          driver || user?.result?.driverLicenses
            ? "Cập nhật thành công"
            : "Đăng kí thành công";

        notification.success({
          message: successMessage,
        });
      } else {
        console.log(error);
      }
    } catch (error) {
      message.error(error.response.data.message);
    }
  };
  const { mutate } = useMutation(onSubmit);

  return (
    <Modal
      open={openRegisterDriver}
      onCancel={handleCancleRegisterDriver}
      footer={[
        <Button
          htmlType="submit"
          type="primary"
          onClick={() => mutate(form.getFieldsValue())}
        >
          {driver || user?.result?.driverLicenses ? "Cập nhật" : " Đăng kí"}
        </Button>,
      ]}
    >
      <p className="flex justify-center items-center w-full text-2xl font-bold">
        {driver || user?.result?.driverLicenses
          ? "Cập nhật GPLX"
          : "Đăng kí GPLX"}
      </p>

      <Form
        form={form}
        layout="vertical"
        name="basic"
        onFinish={(values) => {
          mutate(values);
        }}
        label
        initialValues={{
          ...(driver?.result || {}),
          ...(user?.result?.driverLicenses || {}),
        }}
        autoComplete="off"
        className="flex gap-4 mt-10"
      >
        <div className="w-2/3">
          <Form.Item
            label="Số GPLX"
            name="drivingLicenseNo"
            rules={[
              {
                required: true,
                message: "Số GPLX không được để trống!",
              },
            ]}
            hasFeedback
          >
            <InputNumber className="w-full" />
          </Form.Item>

          <Form.Item label="Hạng" name="class" required hasFeedback>
            <Select
              className="py-0"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.value.toLowerCase() ?? "").includes(
                  input.toLowerCase()
                )
              }
              filterSort={(optionA, optionB) =>
                (optionA?.value ?? "")
                  .toLowerCase()
                  .localeCompare((optionB?.value ?? "").toLowerCase())
              }
              options={[
                { value: "B1" },
                { value: "B2" },
                { value: "C" },
                { value: "D" },
                { value: "E" },
                { value: "F" },
                { value: "FB2" },
                { value: "FC" },
                { value: "FD" },
                { value: "FE" },
              ]}
            />
          </Form.Item>
        </div>

        <div className="grow w-1/3">
          <Form.Item
            label="Hình ảnh"
            name="image"
            rules={[
              {
                required: true,
                message: "Hình Ảnh Không được để trống!",
              },
            ]}
          >
            <UploadImage />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
}
