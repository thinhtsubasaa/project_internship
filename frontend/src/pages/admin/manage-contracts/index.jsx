"use client";
import { getBookings } from "@/apis/admin-bookings.api";
import {
  GET_BOOKINGS_KEY,
  GET_CONTRACTS_KEY,
} from "@/constants/react-query-key.constant";
import { AdminLayout } from "@/layouts/AdminLayout";
import { formatCurrency } from "@/utils/number.utils";
import moment from "moment";

import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../../../../firebase.js"; // Import your Firebase storage instance
import axios from "axios";

import { useMutation } from "@tanstack/react-query";
import dayjs from "dayjs";
import {
  CloudUploadOutlined,
  PlusOutlined,
  SearchOutlined,
  UserAddOutlined,
  PlusCircleOutlined,
  UploadOutlined,
  DeleteOutlined,
  MinusCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import {
  Avatar,
  message,
  Button,
  Form,
  Image,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Table,
  Upload,
  Space,
  Tooltip,
  DatePicker,
} from "antd";
import { useEffect, useState, useRef } from "react";
import { getContracts, getListContracts } from "@/apis/admin-contracts.api.js";
import { Worker } from "@react-pdf-viewer/core";
// Import the main component
import { Viewer } from "@react-pdf-viewer/core";

// Import the styles
import "@react-pdf-viewer/core/lib/styles/index.css";
import Highlighter from "react-highlight-words";
import { useRouter } from "next/router";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import { useAccessTokenValue } from "@/recoils/accessToken.state.js";
import isBetween from "dayjs/plugin/isBetween";
import {
  GET_FINAL_CONTRACTS_KEY,
  GET_LIST_CONTRACTS_KEY,
} from "@/constants/react-query-key.constant";
// Import styles
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import Docxtemplater from "docxtemplater";
import { UploadContract } from "@/components/UploadContract.jsx";
import PizZip from "pizzip";
import { saveAs, FileSaver } from "file-saver";
import { useUserState } from "@/recoils/user.state.js";
let PizZipUtils = null;
if (typeof window !== "undefined") {
  import("pizzip/utils/index.js").then(function (r) {
    PizZipUtils = r;
  });
}
import useLocalStorage from "@/hooks/useLocalStorage";
function loadFile(url, callback) {
  PizZipUtils.getBinaryContent(url, callback);
}
export default function AdminManageContracts() {
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  const [user, setUser] = useUserState();
  const [urlFile, setUrlFile] = useState("");

  const [form] = Form.useForm();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [file, setFile] = useState(null);
  const [accessToken] = useLocalStorage("access_token");

  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);
  const router = useRouter();
  const [days, setDays] = useState();
  const [filteredInfo, setFilteredInfo] = useState({});
  const handleChange = (pagination, filters) => {
    setFilteredInfo(filters);
  };

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  function dateDiffInDays(date1, date2) {
    const oneDay = 24 * 60 * 60 * 1000;

    const timeDiff = Math.abs(date1.getTime() - date2.getTime());

    const diffDays = Math.round(timeDiff / oneDay);

    return diffDays;
  }

  useEffect(() => {
    // Tính toán giá trị mới cho amount dựa trên totalDays

    const newAmount =
      form.getFieldValue("totalCostNumber") -
      (form.getFieldValue("cost") * days * 70) / 100;

    console.log(newAmount);
    // Cập nhật initialValues
    form.setFieldsValue({
      cost_settlement: newAmount || null, // Định dạng số tiền theo ý muốn
    });
  }, [days]);

  const handleDays = (value) => {
    console.log(value);
    const startDate = new Date(moment(value?.format("YYYY-MM-DD"))?._i);

    const arrayDayEnd = form
      .getFieldValue("timeBookingEnd")
      .split(" ")[0]
      .split("-");
    const endDate = new Date(
      `${arrayDayEnd[1]}-${arrayDayEnd[0]}-${arrayDayEnd[2]}`
    );
    // const endDate = new Date(
    //   moment(
    //     moment(form.getFieldValue("timeBookingEnd")).format("YYYY-DD-MM")
    //   )?._i
    // );
    const totalDays = dateDiffInDays(endDate, startDate);
    setDays(totalDays);
  };
  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };
  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div
        style={{
          padding: 8,
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: "block",
          }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{
              width: 90,
            }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{
              width: 90,
            }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({
                closeDropdown: false,
              });
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? "#1677ff" : undefined,
        }}
      />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{
            backgroundColor: "#ffc069",
            padding: 0,
          }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

  const generateDocument = (contract) => {
    loadFile(
      "https://firebasestorage.googleapis.com/v0/b/rental-945b7.appspot.com/o/pdfs%2Ftat_toan_hop_dong_thue_xe.docx?alt=media&token=f2e3ec7c-bd2d-457a-95ec-90aaed59e5a3",
      function (error, content) {
        if (error) {
          throw error;
        }
        var zip = new PizZip(content);
        var doc = new Docxtemplater().loadZip(zip);
        doc.setData({
          address: contract.address,
          fullName: contract?.bookBy,
          phone: contract.phone,
          id: contract.bookingId,
          phoneNumber: user?.result.phoneNumber,
          nameStaff: user?.result.fullname,
          role: user?.result.role === "staff" ? "Nhân viên" : "Quản lý",

          model: contract.model,
          yearManufacture: contract.yearManufacture,
          numberSeat: contract.numberSeat,
          numberCar: contract.numberCar,
          totalCost: contract.totalCost,
          timeBookingStart: contract.timeBookingStart,
          timeBookingEnd: contract.timeBookingEnd,

          day: moment().date(),
          month: moment().month() + 1,
          year: moment().year(),
        });
        try {
          // render the document (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
          doc.render();
        } catch (error) {
          // The error thrown here contains additional information when logged with JSON.stringify (it contains a properties object containing all suberrors).
          function replaceErrors(key, value) {
            if (value instanceof Error) {
              return Object.getOwnPropertyNames(value).reduce(function (
                error,
                key
              ) {
                error[key] = value[key];
                return error;
              },
              {});
            }
            return value;
          }
          console.log(JSON.stringify({ error: error }, replaceErrors));

          if (error.properties && error.properties.errors instanceof Array) {
            const errorMessages = error.properties.errors
              .map(function (error) {
                return error.properties.explanation;
              })
              .join("\n");
            console.log("errorMessages", errorMessages);
            // errorMessages is a humanly readable message looking like this :
            // 'The tag beginning with "foobar" is unopened'
          }
          throw error;
        }

        var out = doc.getZip().generate({
          type: "blob",
          mimeType:
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        });

        saveAs(
          out,
          `Tat_toan_hop_dong_${contract.bookBy}_${contract.numberCar}.docx`
        );
      }
    );
  };

  const onSubmit = async (values) => {
    try {
      // setTimeout(() => {
      //   setOpen(false);
      // }, 500);

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_REACT_APP_BACKEND_URL}/final-contracts/create/${values._id}`,
        {
          images: values?.images || undefined,
          timeFinish:
            moment(values?.timeFinish?.format("YYYY-MM-DD"))._i || undefined,
          cost_settlement: values?.cost_settlement || values?.totalCostNumber,
          note: values?.note || undefined,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      console.log(response);

      if (response.status === 201) {
        message.success("Create final contract successfully");
        setOpen(false);
        refetch();
      } else {
        message.error("Error submitting the form. Please try again later.");
        setOpen(false);
        refetch();
      }
    } catch (apiError) {
      message.error("Error submitting the form. Please try again later.");
      setOpen(false);
      refetch();
    }
  };

  const { mutate } = useMutation(onSubmit);

  const beforeUpload = (file) => {
    // Check if the uploaded file is a PDF
    if (file.type !== "application/pdf") {
      message.error("Only PDF files are allowed.");
      return false;
    }

    // Update the state with the selected file
    setFile(file);
    return false; // Prevent the default upload action
  };

  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModalView = (contract) => {
    setIsModalOpen(true);
    console.log(contract.file);

    setUrlFile(contract.file);
  };

  const handleOkView = () => {
    setIsModalOpen(false);
  };

  const handleCancelView = () => {
    setIsModalOpen(false);
  };

  const showModal = (booking) => {
    setOpen(true);

    form.setFieldsValue({
      // timeFinish: moment(new Date()),
      ...booking,
    });
  };
  const handleOk = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOpen(false);
    }, 1000);
  };
  const handleCancel = () => {
    console.log("Clicked cancel button");
    setOpen(false);
  };

  const disabledDate = (current) => {
    const arrayDayEnd = form
      .getFieldValue("timeBookingEnd")
      .split(" ")[0]
      .split("-");
    const dEnd = new Date(
      `${arrayDayEnd[1]}-${arrayDayEnd[0]}-${arrayDayEnd[2]}`
    );
    dEnd.setDate(dEnd.getDate() + 1);

    const arrayDayStart = form
      .getFieldValue("timeBookingStart")
      .split(" ")[0]
      .split("-");
    const dStart = new Date(
      `${arrayDayStart[1]}-${arrayDayStart[0]}-${arrayDayStart[2]}`
    );

    return current < dStart || current > dEnd;
  };

  const { data, refetch } = useQuery({
    queryKey: [GET_LIST_CONTRACTS_KEY, accessToken, user?.result?.role],
    queryFn: async () =>
      await getListContracts(accessToken, user?.result?.role),
  });

  console.log(data?.result);

  const dataSource = data?.result.map((item, idx) => ({
    id: idx + 1,
    _id: item?._id,
    bookingId: item?.bookingId?._id,
    image: item?.images,
    createBy: item?.createBy?.fullname,
    bookBy: item?.bookingId?.bookBy?.fullname,
    email: item?.bookingId?.bookBy?.email,
    phone: item?.bookingId?.phone,
    address: item?.bookingId?.address,

    numberCar: item?.bookingId?.carId?.numberCar,
    model: item?.bookingId?.carId?.model?.name,
    cost: item?.bookingId?.carId?.cost,
    numberSeat: item?.bookingId?.carId?.numberSeat,
    yearManufacture: item?.bookingId?.carId?.yearManufacture,

    timeBookingStart: moment(item?.bookingId?.timeBookingStart).format(
      "DD-MM-YYYY HH:mm"
    ),
    timeBookingEnd: moment(item?.bookingId?.timeBookingEnd).format(
      "DD-MM-YYYY HH:mm"
    ),
    totalCost: formatCurrency(item?.bookingId?.totalCost),
    totalCostNumber: item?.bookingId?.totalCost,
    file: item?.file,
    status: item?.status,
  }));

  return (
    <>
      <div className="mt-4 shadow-lg rounded-lg">
        <Table
          onChange={handleChange}
          scroll={{ x: 2300, y: 500 }}
          columns={[
            { key: "id", title: "ID", dataIndex: "id", width: "4%" },
            {
              key: "image",
              title: "Ảnh hợp đồng",
              dataIndex: "image",

              render: (images) => (
                <Image.PreviewGroup
                  preview={{
                    onChange: (current, prev) =>
                      console.log(
                        `current index: ${current}, prev index: ${prev}`
                      ),
                  }}
                  items={images}
                >
                  <Image
                    className="h-32 aspect-video rounded-md object-cover"
                    src={images[0]}
                  />
                </Image.PreviewGroup>
              ),
            },
            // {
            //   key: "createBy",
            //   title: "Người Tạo Hợp Đồng",
            //   dataIndex: "createBy",
            //   ...getColumnSearchProps("createBy"),
            // },
            {
              key: "bookBy",
              title: "Tên Khách Hàng",
              dataIndex: "bookBy",
              ...getColumnSearchProps("bookBy"),
            },

            {
              key: "email",
              title: "Email",
              dataIndex: "email",
              ...getColumnSearchProps("email"),
            },

            {
              key: "phone",
              title: "Số Điện Thoại",
              dataIndex: "phone",
              ...getColumnSearchProps("phone"),
            },
            {
              key: "addres",
              title: "Điạ Chỉ",
              dataIndex: "address",
              ...getColumnSearchProps("address"),
            },
            {
              key: "totalCost",
              title: "Tổng Số Tiền",
              dataIndex: "totalCost",
            },
            {
              key: "timeBookingStart",
              title: "Thời Gian Bắt Đầu",
              dataIndex: "timeBookingStart",
            },
            {
              key: "timeBookingEnd",
              title: "Thời Gian Kết Thúc",
              dataIndex: "timeBookingEnd",
            },

            // {
            //   key: "thumb",
            //   title: "Thumbnail",
            //   dataIndex: "thumb",
            //   render: (url) => (
            //     <div>
            //       <Document file={url} onLoadSuccess={onDocumentLoadSuccess}>
            //         <Page pageNumber={pageNumber} />
            //       </Document>
            //       <p>
            //         Page {pageNumber} of {numPages}
            //       </p>
            //     </div>
            //   ),
            //  },

            {
              key: "status",
              title: "Trạng Thái",
              dataIndex: "status",
              width: "8%",
              filters: [
                {
                  text: "Đang thực hiện",
                  value: "Đang thực hiện",
                },
                {
                  text: "Đã tất toán",
                  value: "Đã tất toán",
                },
              ],

              onFilter: (value, record) => record.status.includes(value),

              fixed: "right",
              render: (status) => (
                <>
                  {status === "Đang thực hiện" ? (
                    <>
                      <p className="text-blue-500 flex justify-center">
                        <MinusCircleOutlined
                          style={{
                            color: "blue",
                            fontSize: "12px",
                            marginRight: "5px",
                          }}
                        />
                        Đang Thực Hiện
                      </p>
                    </>
                  ) : status === "Đã tất toán" ? (
                    <>
                      <p className="text-green-600 flex justify-center">
                        <CheckCircleOutlined
                          style={{
                            color: "green",
                            fontSize: "12px",
                            marginRight: "5px",
                          }}
                        />
                        Đã Tất Toán
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-red-500 flex justify-center">
                        <ExclamationCircleOutlined
                          style={{
                            color: "red",
                            fontSize: "12px",
                            marginRight: "5px",
                          }}
                        />
                        Đã Hủy
                      </p>
                    </>
                  )}
                </>
              ),
            },

            {
              key: "action",
              fixed: "right",
              width: "6%",
              render: (_, contract) => (
                <div className="flex gap-2">
                  {contract.status === "Đã tất toán" ? (
                    <Button
                      type="primary"
                      className=" border border-solid  "
                      onClick={() => showModal(contract)}
                      disabled
                    >
                      <PlusCircleOutlined style={{ fontSize: "14px" }} />
                    </Button>
                  ) : (
                    <Tooltip
                      placement="topLeft"
                      title={"Tạo hợp đồng tất toán"}
                      color={"rgb(74 222 128)"}
                    >
                      <Button
                        type="primary"
                        className=" border border-solid border-green-400 "
                        onClick={() => showModal(contract)}
                      >
                        <PlusCircleOutlined style={{ fontSize: "14px" }} />
                      </Button>
                    </Tooltip>
                  )}

                  <Tooltip
                    placement="top"
                    title={"Tải file để tạo hợp đồng tất toán"}
                    color="cyan"
                  >
                    <Button
                      className=" border border-solid border-green-400 bg-cyan-400"
                      onClick={() => generateDocument(contract)}
                    >
                      <DownloadOutlined style={{ fontSize: "14px" }} />
                    </Button>
                  </Tooltip>
                </div>

                // <div className="flex gap-2">
                //   <Button
                //     type="primary"
                //     className=" border border-solid border-green-400 "
                //     onClick={() => showModalView(contract)}
                //   >
                //     <EyeOutlined style={{ fontSize: "14px" }} />
                //   </Button>
                //   <Button
                //     type="primary"
                //     className=" border border-solid border-green-400 "
                //     onClick={() => showModal(contract)}
                //   >
                //     <PlusCircleOutlined style={{ fontSize: "14px" }} />
                //   </Button>
                //   <Popconfirm
                //     title="Are you sure to deactivate this car?"
                //     okText="Deactivate"
                //   >
                //     <Button className="bg-red-500 text-white border-none hover:bg-red-500/70">
                //       <DeleteOutlined style={{ fontSize: "14px" }} />
                //     </Button>
                //   </Popconfirm>
                // </div>
              ),
            },
          ]}
          dataSource={dataSource}
          rowKey="id"
        />
      </div>
      <Modal
        title="Tất toán hợp đồng"
        open={open}
        onOk={handleOk}
        footer={null}
        width={800}
        style={{ top: 20 }}
        onCancel={handleCancel}
      >
        <>
          <Form
            form={form}
            onFinish={(values) => {
              mutate(values);
            }}
            layout="vertical"
            className="flex gap-4 mt-10 h-[80vh] overflow-y-scroll"
          >
            <div className="w-2/3">
              <Form.Item label="Tên khách hàng" name="bookBy">
                <Input readOnly />
              </Form.Item>
              <Form.Item label="Số điện thoại" name="phone">
                <Input readOnly />
              </Form.Item>
              <Form.Item label="Địa chỉ" name="address">
                <Input readOnly />
              </Form.Item>
              <Form.Item label="Biển số xe" name="numberCar">
                <Input readOnly />
              </Form.Item>
              <Form.Item label="Thời gian bắt đầu thuê" name="timeBookingStart">
                <Input readOnly />
              </Form.Item>
              <Form.Item label="Thời gian kết thúc thuê" name="timeBookingEnd">
                <Input readOnly />
              </Form.Item>
              <Form.Item label="Tổng giá tiền thuê" name="totalCost">
                <Input readOnly />
              </Form.Item>
              <Form.Item label="Contract id" hidden name="_id">
                <Input />
              </Form.Item>

              <Form.Item label="Cost" hidden name="cost">
                <Input />
              </Form.Item>
              <Form.Item
                label="Tổng giá tiền thuê bang so"
                hidden
                name="totalCostNumber"
              >
                <Input readOnly />
              </Form.Item>

              <h2>Trả xe trước thời hạn(nếu có)</h2>
              <Form.Item label="Thời gian kết thúc thuê" name="timeFinish">
                <DatePicker
                  format="DD-MM-YYYY"
                  disabledDate={disabledDate}
                  onChange={handleDays}
                />
              </Form.Item>
              <Form.Item
                label="Giá trị kết toán hợp đồng"
                name="cost_settlement"
              >
                <InputNumber
                  readOnly
                  formatter={(value) =>
                    `${value} VND`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/\VND\s?|(,*)/g, "")}
                  style={{ width: "170px" }}
                />
              </Form.Item>
              <Form.Item label="Ghi chú" name="note">
                <Input />
              </Form.Item>

              <div className=" mt-10">
                <Button type="primary" htmlType="submit">
                  Submit
                </Button>
              </div>
            </div>

            <div className="grow w-1/3">
              <Form.Item
                label="Ảnh hợp đồng"
                name="images"
                rules={[
                  {
                    required: true,
                    message: "Hãy đăng ảnh tất toán hợp đồng lên!",
                  },
                ]}
              >
                <UploadContract />
              </Form.Item>
            </div>
          </Form>
        </>
      </Modal>
    </>
  );
}

AdminManageContracts.Layout = AdminLayout;
