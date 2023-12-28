import React, { useState } from "react";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useUserState } from "@/recoils/user.state.js";
import { useDriverState } from "@/recoils/driver.state.js";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import axios from "axios";
import Image from "next/image";
import { Button, Input, Form, notification, Typography } from "antd";
import styled from "@emotion/styled";

const { Title } = Typography;

const StyleInputPassword = styled(Input.Password)`
  width: 400px;
  height: 50px;
  border-color: #949494;
`;
const ButtonSummit = styled(Button)`
  width: 400px;
  height: 50px;
  font-size: 18px;
  font-weight: 700;
  padding: 30px auto;
`;

export default function ChangePassword({}) {
  const validateStrongPassword = (_, value) => {
    if (!value) {
      return Promise.reject("Hãy nhập mật khẩu!");
    }
    if (value.length < 6 || value.length > 40) {
      return Promise.reject("Độ dài mật khẩu từ 6 đến 40 ký tự!");
    }

    if (
      !/[a-z]/.test(value) ||
      !/[A-Z]/.test(value) ||
      !/\d/.test(value) ||
      !/[\W_]/.test(value)
    ) {
      return Promise.reject(
        `Phải có ít nhật một ký tự đặc biệt(@!>...), in hoa,
         thường, số!`
      );
    }

    return Promise.resolve();
  };
  const [form] = Form.useForm();
  const [user, setUser] = useUserState();
  const [driver, setDriver] = useDriverState();
  const [loading, setLoading] = useState(false);

  const [accessToken, setAccessToken, clearAccessToken] =
    useLocalStorage("access_token");

  const updateProfile = async (values) => {
    const userId = user?.id;
    try {
      console.log(userId);
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_REACT_APP_BACKEND_URL}/users/change-password`,
        values,

        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            withCredentials: true,
          },
        }
      );
      console.log(response);
      if (response.status === 200) {
        console.log(response.data);

        setUser((user) => ({
          ...user,
          result: {
            ...user.result,
            oldPassword: response.data.result.oldPassword,
            newPassword: response.data.result.newPassword,
          },
        }));
        notification.success({
          message: "Cập nhật thành công",
        });
      } else {
        console.log(error.response.data.errors[0].msg);
      }
    } catch (error) {
      console.log(error);
      notification.error({
        message: "Lỗi",
        description: "Mật khẩu cũ không chính xác. Vui lòng thử lại sau.",
      });
    }
    // {
    //   toast.error(error.response.data.errors[0].msg, {
    //     position: toast.POSITION.TOP_CENTER,
    //   });
    // }
  };

  const { mutate, isLoading } = useMutation(updateProfile, {
    onMutate: () => {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
      }, 100);
    },
  });

  return (
    <div className="flex flex-col">
      <div className="flex flex-col justify-center items-center h-full mt-0 ">
        <Title>Đổi mật khẩu</Title>

        <div>
          <Form
            layout="vertical"
            name="change-password"
            style={{
              maxWidth: 600,
            }}
            form={form}
            onFinish={(values) => {
              mutate(values);
            }}
            autoComplete="off"
            className="mt-5"
          >
            {/* Old Password */}
            <Form.Item
              name="oldPassword"
              rules={[{ validator: validateStrongPassword }]}
              hasFeedback
            >
              <StyleInputPassword
                type="password"
                placeholder="Mật khẩu cũ"
                size="large"
              />
            </Form.Item>

            {/* New Password */}
            <Form.Item
              name="newPassword"
              rules={[{ validator: validateStrongPassword }]}
              hasFeedback
            >
              <StyleInputPassword
                type="password"
                placeholder="Mật khẩu mới"
                size="large"
              />
            </Form.Item>

            {/* Confirm Password */}
            <Form.Item
              name="confirmPassword"
              dependencies={["newPassword"]}
              hasFeedback
              rules={[
                {
                  required: true,
                  message: "Please confirm your password!",
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("newPassword") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("The new passwords do not match!")
                    );
                  },
                }),
              ]}
            >
              <StyleInputPassword
                type="password"
                placeholder="Xác thực mật khẩu"
                size="large"
              />
            </Form.Item>

            <Form.Item>
              <ButtonSummit type="primary" htmlType="submit">
                Cập nhập
              </ButtonSummit>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
}
