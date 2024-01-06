import React from "react";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useUserState } from "@/recoils/user.state.js";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Button, Input, Form, notification, Modal, Select } from "antd";
import styled from "@emotion/styled";

const ButtonSummit = styled(Button)`
  width: 100%;
  height: 50px;
  font-size: 18px;
  font-weight: 700;
  padding: 30px auto;
`;

export default function EditProfileModal({
  openEditModal,
  handleCancleEditModal,
}) {
  const validatePhoneNumber = (_, value) => {
    // Simple regex pattern for a basic phone number validation
    const phoneNumberRegex = /^(?:\d{10}|\d{11})$/;

    if (!value) {
      return Promise.reject("Hãy nhập số điện thoại!");
    }

    if (!phoneNumberRegex.test(value)) {
      return Promise.reject("Không phải số điện thoại!");
    }

    return Promise.resolve();
  };
  const validateFullname = (_, value) => {
    // Simple regex pattern for checking if fullname contains numbers
    const numberRegex = /\d/;

    if (!value) {
      return Promise.reject("Hãy nhập họ và tên!");
    }

    if (numberRegex.test(value)) {
      return Promise.reject("Họ và tên không được nhập số!");
    }

    return Promise.resolve();
  };
  const [form] = Form.useForm();
  const [user, setUser] = useUserState();

  const [accessToken, setAccessToken, clearAccessToken] =
    useLocalStorage("access_token");

  const updateProfile = async (values) => {
    const userId = user?.id;
    try {
      console.log(userId);
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_REACT_APP_BACKEND_URL}/users/update-user/${userId}`,
        values,

        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            withCredentials: true,
          },
        }
      );
      if (response.status === 200) {
        console.log(response.data);

        setUser((user) => ({
          ...user,
          result: {
            ...user.result,
            address: response.data.result.address,
            email: response.data.result.email,
            phoneNumber: response.data.result.phoneNumber,
            fullname: response.data.result.fullname,
            gender: response.data.result.gender,
          },
        }));

        handleCancleEditModal();
        notification.success({
          message: "Cập nhật thành công",
        });
      } else {
        console.log(error);
      }
    } catch (error) {
      notification.error({
        message: "Lỗi",
        description: "Có lỗi xảy ra khi cập nhật. Vui lòng thử lại sau",
      });
    }
  };

  const { mutate } = useMutation(updateProfile);

  return (
    <Modal
      open={openEditModal}
      onCancel={handleCancleEditModal}
      footer={[
        <ButtonSummit
          htmlType="submit"
          type="primary"
          onClick={() => mutate(form.getFieldsValue())}
        >
          Cập nhập
        </ButtonSummit>,
      ]}
    >
      <p className="flex justify-center items-center w-full text-2xl font-bold">
        Cập nhật thông tin
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
          ...user?.result,
        }}
        autoComplete="off"
        className="mt-5 "
      >
        <Form.Item
          label="Fullname"
          name="fullname"
          rules={[{ validator: validateFullname }]}
        >
          <Input size="large" />
        </Form.Item>
        <Form.Item
          label="Địa chỉ"
          name="address"
          rules={[
            {
              type: "text",
              message: "The input is not valid address",
            },
          ]}
        >
          <Input size="large" />
        </Form.Item>
        <Form.Item
          label="Email"
          name="email"
          rules={[
            {
              type: "email",
              message: "The input is not valid E-mail!",
            },
          ]}
        >
          <Input size="large" />
        </Form.Item>
        <Form.Item
          label="Số điện thoại"
          name="phoneNumber"
          rules={[{ validator: validatePhoneNumber }]}
        >
          <Input size="large" />
        </Form.Item>
        <Form.Item label="Giới tính" name="gender">
          <Select options={[{ value: "Nam" }, { value: "Nữ" }]} size="large" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
